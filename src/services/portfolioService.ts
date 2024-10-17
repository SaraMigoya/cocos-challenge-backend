import { MarketData, Order, User } from '../entities/index';
import { AppDataSource } from '../database/db';


export class PortfolioService {
    static async getPortfolio(userId: number) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const orderRepository = AppDataSource.getRepository(Order);
            const marketDataRepository = AppDataSource.getRepository(MarketData);

            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) throw new Error('User not found');

            const filledOrders = await orderRepository.find({
                where: { user: { id: userId }, status: 'FILLED' },
                relations: ['instrument'],
            });

            // Obtener órdenes de CASH_IN y CASH_OUT para calcular el cash position
            const cashInOrders = await orderRepository.find({
                where: { user: { id: userId }, side: 'CASH_IN', status: 'FILLED' }
            });
            const cashOutOrders = await orderRepository.find({
                where: { user: { id: userId }, side: 'CASH_OUT', status: 'FILLED' }
            });

            const cashInTotal = cashInOrders.reduce((sum, order) => sum + order.size * order.price, 0);
            const cashOutTotal = cashOutOrders.reduce((sum, order) => sum + order.size * order.price, 0);
            const cashPosition = cashInTotal - cashOutTotal;

            let totalAccountValue = cashPosition;
            const assets = [];

            for (const order of filledOrders) {
                const marketData = await marketDataRepository.findOne({
                    where: { instrument: { id: order.instrument.id } },
                    order: { date: 'DESC' }
                });

                if (marketData) {

                    const totalValue = order.size * marketData.close;
                    const performance = ((marketData.close - order.price) / order.price) * 100;

                    assets.push({
                        instrument: order.instrument.name,
                        size: order.size,
                        totalValue: totalValue,
                        performance: performance.toFixed(2)
                    });
                    totalAccountValue += totalValue;
                }
            }

            const portfolio = {
                totalAccountValue: totalAccountValue,
                cashPosition: cashPosition,
                assets: assets,
            };

            return portfolio;

        } catch (error) {
            console.error('Error en getPortfolio:', error);
            throw error;
        }
    }
}
