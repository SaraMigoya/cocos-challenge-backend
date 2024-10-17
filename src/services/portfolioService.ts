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

            const cashInOrders = orders.filter(order => order.side === 'CASH_IN');
            const cashOutOrders = orders.filter(order => order.side === 'CASH_OUT');

            const cashInTotal = cashInOrders.reduce((sum, order) => sum + order.size * order.price, 0);
            const cashOutTotal = cashOutOrders.reduce((sum, order) => sum + order.size * order.price, 0);
            const cashPosition = cashInTotal - cashOutTotal;

            // Filtrar las órdenes de activos
            const filledOrders = orders.filter(order => order.side !== 'CASH_IN' && order.side !== 'CASH_OUT');
            let totalAccountValue = cashPosition;

            const instrumentIds = filledOrders.map(order => order.instrument.id);

            // Consultar datos de mercado para todos los instrumentos de una sola vez
            const marketDataList = await marketDataRepository.find({
                where: { instrument: { id: In(instrumentIds) } },
                relations: ['instrument'],
                order: { date: 'DESC' },
            });

            // acceder  a los datos de mercado por instrumento
            const marketDataMap = new Map<number, MarketData>();
            marketDataList.forEach(marketData => {
                marketDataMap.set(marketData.instrument.id, marketData);
            });

            marketDataList.forEach(marketData => {
                if (marketData.instrument && marketData.instrument.id) {
                    marketDataMap.set(marketData.instrument.id, marketData);
                } else {
                    console.warn('MarketData no instrument found::', marketData);
                }
            });
            const assets = filledOrders.map(order => {
                const marketData = marketDataMap.get(order.instrument.id);
                if (!marketData) return null;

                const totalValue = order.size * marketData.close;
                const performance = ((marketData.close - order.price) / order.price) * 100;

                totalAccountValue += totalValue;

                return {
                    instrument: order.instrument.name,
                    size: order.size,
                    totalValue: totalValue,
                    performance: performance.toFixed(2)
                };
            }).filter(asset => asset !== null);


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
