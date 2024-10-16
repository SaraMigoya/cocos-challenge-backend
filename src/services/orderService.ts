import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../database/db';
import { Order, MarketData, User, Instrument } from '../entities/index';
export class OrderService {
    static async placeOrder(orderData: any) {
        const userRepository = AppDataSource.getRepository(User);
        const orderRepository = AppDataSource.getRepository(Order);
        const marketDataRepository = AppDataSource.getRepository(MarketData);

        const queryRunner = AppDataSource.createQueryRunner();
        console.log('placeOrder:', orderData.instrumentId);
        try {
            // Iniciar la transacción
            await queryRunner.startTransaction();

            // Verificar si el usuario existe
            const user = await userRepository.findOne({ where: { id: orderData.userId } });
            if (!user) throw new Error('User not found');

            // Verificar si el activo existe y obtener el último precio (close)
            const marketData = await marketDataRepository.findOne({
                where: { instrument: { id: orderData.instrumentId } },
                order: { date: 'DESC' }
            });
            if (!marketData) throw new Error('Instrument not found or no recent market data available');

            // Manejo de órdenes tipo MARKET o LIMIT
            let totalCost = 0;
            if (orderData.type === 'MARKET') {
                // Usar el precio de mercado actual (close)
                orderData.price = marketData.close;
                orderData.status = 'FILLED';
                totalCost = marketData.close * orderData.size;
            } else if (orderData.type === 'LIMIT') {
                // En órdenes LIMIT, el precio lo define el usuario
                if (!orderData.price) throw new Error('Price must be provided for LIMIT orders');
                orderData.status = 'NEW';
                totalCost = orderData.price * orderData.size;
            }

            // Validaciones para órdenes de compra (BUY) 
            //TODO:
            // - Mejorar la response de error para el cliente
            // - Fix bug: no se esta guardando la orden como REJECTED, directamente se rechaza
            if (orderData.side === 'BUY') {
                const cashAvailable = await this.getCashAvailable(orderData.userId);
                if (totalCost > cashAvailable) {
                    await this.rejectOrder(queryRunner, orderData, 'Not enough cash to complete the BUY order');
                    throw new Error('Not enough cash to complete the BUY order');
                }
            }

            // Validaciones para órdenes de venta (SELL)
            //TODO: 
            // - Mejorar la response de error para el cliente
            // - Fix bug: no se esta guardando la orden como REJECTED, directamente se rechaza
            if (orderData.side === 'SELL') {
                const totalOwned = await this.getTotalOwned(orderData.userId, orderData.instrumentId);
                if (orderData.size > totalOwned) {
                    await this.rejectOrder(queryRunner, orderData, 'Not enough assets to complete the SELL order');
                    throw new Error('Not enough assets to complete the SELL order');
                }
            }

            const newOrder = orderRepository.create({
                user: user,
                instrument: { id: orderData.instrumentId },
                size: orderData.size,
                price: orderData.price,
                side: orderData.side,
                type: orderData.type,
                status: orderData.status,
                datetime: new Date(),
            });

            // Si es una orden MARKET, se ejecuta inmediatamente
            if (orderData.type === 'MARKET') {
                await this.executeOrder(newOrder, queryRunner);
            } else {
                await orderRepository.save(newOrder);
            }

            await queryRunner.commitTransaction();
            return newOrder;

        } catch (error) {
            console.error('Error in placeOrder:', error);

            await queryRunner.rollbackTransaction();
            throw error;
        } finally {

            await queryRunner.release();
        }
    }

    // Obtener el total de cash disponible para el usuario
    static async getCashAvailable(userId: number) {
        const orderRepository = AppDataSource.getRepository(Order);
        const cashIn = await orderRepository.createQueryBuilder('o')  // Cambiar 'order' por 'o'
            .select('SUM(o.size * o.price)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.side = :side', { side: 'CASH_IN' })
            .andWhere('o.status = :status', { status: 'FILLED' })
            .getRawOne();

        const cashOut = await orderRepository.createQueryBuilder('o')  // Cambiar 'order' por 'o'
            .select('SUM(o.size * o.price)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.side = :side', { side: 'CASH_OUT' })
            .andWhere('o.status = :status', { status: 'FILLED' })
            .getRawOne();

        return (cashIn?.total || 0) - (cashOut?.total || 0);
    }

    // Obtener el total de activos poseídos por el usuario
    static async getTotalOwned(userId: number, instrumentId: number) {
        const orderRepository = AppDataSource.getRepository(Order);

        const bought = await orderRepository.createQueryBuilder('o')  // Cambiar 'order' por 'o'
            .select('SUM(o.size)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.instrumentId = :instrumentId', { instrumentId })
            .andWhere('o.side = :side', { side: 'BUY' })
            .andWhere('o.status = :status', { status: 'FILLED' })
            .getRawOne();

        const sold = await orderRepository.createQueryBuilder('o')  // Cambiar 'order' por 'o'
            .select('SUM(o.size)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.instrumentId = :instrumentId', { instrumentId })
            .andWhere('o.side = :side', { side: 'SELL' })
            .andWhere('o.status = :status', { status: 'FILLED' })
            .getRawOne();

        return (bought?.total || 0) - (sold?.total || 0);
    }

    // Ejecutar la orden de tipo MARKET
    static async executeOrder(order: Order, queryRunner: QueryRunner) {
        const orderRepository = queryRunner.manager.getRepository(Order);
        order.status = 'FILLED';
        await orderRepository.save(order);
    }

    // Rechazar la orden si no es válida
    static async rejectOrder(queryRunner: QueryRunner, orderData: any, reason: string) {
        const orderRepository = queryRunner.manager.getRepository(Order);
        const rejectedOrder = orderRepository.create({
            user: { id: orderData.userId },
            instrument: { id: orderData.instrumentId },
            size: orderData.size,
            price: orderData.price,
            side: orderData.side,
            type: orderData.type,
            status: 'REJECTED',
            datetime: new Date(),
        });
        await orderRepository.save(rejectedOrder);
        console.error(`Order rejected: ${reason}`);
    }
}




