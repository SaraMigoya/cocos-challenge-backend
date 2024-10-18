import { MarketData, Order, User } from '../entities/index';
import { AppDataSource } from '../database/db';
import { In } from 'typeorm';
export class PortfolioService {
    static async getPortfolio(userId: number) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const orderRepository = AppDataSource.getRepository(Order);
            const marketDataRepository = AppDataSource.getRepository(MarketData);

            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) throw new Error('User not found');


            const orders = await orderRepository.find({
                where: [
                    { user: { id: userId }, status: 'FILLED' },
                    { user: { id: userId }, side: 'CASH_IN', status: 'FILLED' },
                    { user: { id: userId }, side: 'CASH_OUT', status: 'FILLED' }
                ],
                relations: ['instrument'],
            });


            const cashInTotal = orders
                .filter(order => order.side === 'CASH_IN')
                .reduce((sum, order) => sum + order.size * order.price, 0);

            const cashOutTotal = orders
                .filter(order => order.side === 'CASH_OUT')
                .reduce((sum, order) => sum + order.size * order.price, 0);

            const cashPosition = cashInTotal - cashOutTotal;

            // Filtrar órdenes de activos (no CASH_IN/CASH_OUT)
            const filledOrders = orders.filter(order => order.side !== 'CASH_IN' && order.side !== 'CASH_OUT');
            let totalAccountValue = cashPosition;

            // Obtener los IDs de los instrumentos
            const instrumentIds = filledOrders.map(order => order.instrument.id);

            // Consultar datos de mercado para todos los instrumentos relevantes
            const marketDataList = await marketDataRepository.find({
                where: { instrument: { id: In(instrumentIds) } },
                relations: ['instrument'],
                order: { date: 'DESC' },
            });

            // Crear un mapa de datos de mercado por instrumento
            const marketDataMap = new Map<number, MarketData>();
            marketDataList.forEach(marketData => {
                marketDataMap.set(marketData.instrument.id, marketData);
            });

            // Calcular los activos
            const assets = filledOrders.map(order => {
                const marketData = marketDataMap.get(order.instrument.id);
                if (!marketData) return null;  // Omitir si no hay datos de mercado

                // Calcular el valor total y rendimiento de la posición
                const totalValue = order.size * marketData.close;
                const performance = ((marketData.close - order.price) / order.price) * 100;

                totalAccountValue += totalValue;

                // Calcular retorno diario (utilizando las columnas close y previousClose)
                const dailyReturn = ((marketData.close - marketData.previousClose) / marketData.previousClose) * 100;

                return {
                    instrument: order.instrument.name,
                    size: order.size,
                    totalValue: totalValue,
                    performance: performance.toFixed(2),
                    dailyReturn: dailyReturn.toFixed(2)
                };
            }).filter(asset => asset !== null);  // Filtrar nulos

            // Construir el objeto de portafolio
            const portfolio = {
                totalAccountValue: totalAccountValue,
                cashPosition: cashPosition,
                assets: assets,
            };

            return portfolio;

        } catch (error) {
            console.error('Error in getPortfolio:', error);
            throw error;
        }
    }
}
