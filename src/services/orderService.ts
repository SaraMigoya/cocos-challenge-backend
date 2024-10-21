import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../database/db';
import { Order, MarketData, User } from '../entities/index';

//TODO:
//1. Cuando una orden es ejecutada, se tiene que actualizar el listado de posiciones del usuario.
//2. Cuando una orden es ejecutada, calcular el valor de la cuenta del usuario y los pesos disponibles para operar 
//3.Testear una orden del type LIMIT 
export class OrderService {
    static STATUS_FILLED = 'FILLED';
    static STATUS_NEW = 'NEW';
    static STATUS_REJECTED = 'REJECTED';
    static async placeOrder(orderData: any) {
        const userRepository = AppDataSource.getRepository(User);
        const orderRepository = AppDataSource.getRepository(Order);
        const marketDataRepository = AppDataSource.getRepository(MarketData);

        const queryRunner = AppDataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();

            const user = await userRepository.findOne({ where: { id: orderData.userId } });
            if (!user) throw new Error('User not found');

            // Verificar si el activo existe y obtener el último precio (close)
            const marketData = await marketDataRepository.findOne({
                where: { instrument: { id: orderData.instrumentId } },
                order: { date: 'DESC' }
            });
            if (!marketData) throw new Error('Instrument not found or no recent market data available');

            let totalCost = 0;
            if (orderData.type === 'MARKET') {
                orderData.price = marketData.close;
                orderData.status = 'FILLED';
                totalCost = marketData.close * orderData.size;
            } else if (orderData.type === 'LIMIT') {
                if (!orderData.price) throw new Error('Price must be provided for LIMIT orders');
                orderData.status = 'NEW';
                totalCost = orderData.price * orderData.size;
            }

            if (orderData.side === 'BUY') {
                const cashAvailable = await this.getCashAvailable(orderData.userId);
                if (totalCost > cashAvailable) {
                    await this.rejectOrder(queryRunner, orderData, 'Not enough cash to complete the BUY order');
                    await queryRunner.commitTransaction();
                    return { status: this.STATUS_REJECTED, message: 'Not enough cash to complete the BUY order' };

                }
            }

            if (orderData.side === 'SELL') {
                const totalOwned = await this.getTotalOwned(orderData.userId, orderData.instrumentId);
                if (orderData.size > totalOwned) {
                    await this.rejectOrder(queryRunner, orderData, 'Not enough assets to complete the SELL order');
                    await queryRunner.commitTransaction();
                    return { status: this.STATUS_REJECTED, message: 'Not enough cash to complete the SELL order' };
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
        const cashIn = await orderRepository.createQueryBuilder('o')
            .select('SUM(o.size * o.price)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.side = :side', { side: 'CASH_IN' })
            .andWhere('o.status = :status', { status: this.STATUS_FILLED })
            .getRawOne();

        const cashOut = await orderRepository.createQueryBuilder('o')
            .select('SUM(o.size * o.price)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.side = :side', { side: 'CASH_OUT' })
            .andWhere('o.status = :status', { status: this.STATUS_FILLED })
            .getRawOne();

        return (cashIn?.total || 0) - (cashOut?.total || 0);
    }

    // Obtener el total de activos poseídos por el usuario
    static async getTotalOwned(userId: number, instrumentId: number) {
        const orderRepository = AppDataSource.getRepository(Order);

        const bought = await orderRepository.createQueryBuilder('o')
            .select('SUM(o.size)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.instrument_id = :instrumentId', { instrumentId })
            .andWhere('o.side = :side', { side: 'BUY' })
            .andWhere('o.status = :status', { status: this.STATUS_FILLED })
            .getRawOne();

        const sold = await orderRepository.createQueryBuilder('o')
            .select('SUM(o.size)', 'total')
            .where('o.userId = :userId', { userId })
            .andWhere('o.instrument_id = :instrumentId', { instrumentId })
            .andWhere('o.side = :side', { side: 'SELL' })
            .andWhere('o.status = :status', { status: this.STATUS_FILLED })
            .getRawOne();

        return (bought?.total || 0) - (sold?.p || 0);
    }

    // Ejecutar la orden de tipo MARKET
    static async executeOrder(order: Order, queryRunner: QueryRunner) {
        const orderRepository = queryRunner.manager.getRepository(Order);
        order.status = this.STATUS_FILLED;
        await orderRepository.save(order);
    }
    static async rejectOrder(queryRunner: QueryRunner, orderData: any, reason: string) {
        const orderRepository = queryRunner.manager.getRepository(Order);
        const rejectedOrder = orderRepository.create({
            user: { id: orderData.userId },
            instrument: { id: orderData.instrumentId },
            size: orderData.size,
            price: orderData.price,
            side: orderData.side,
            type: orderData.type,
            status: this.STATUS_REJECTED,
            datetime: new Date(),
        });
        await orderRepository.save(rejectedOrder);
        console.error(`Order rejected: ${reason}`);
    }
}





