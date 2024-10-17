import { AppDataSource } from '../database/db';
import { Order, MarketData } from '../entities/index';


export class OrderService {
    static async placeOrder(orderData: any) {
        const orderRepository = AppDataSource.getRepository(Order);
        const marketDataRepository = AppDataSource.getRepository(MarketData);

        const marketData = await marketDataRepository.findOne({
            where: { instrument: orderData.instrumentId }
        });

        if (!marketData) throw new Error('Market data not found');

        // Si la orden es de tipo MARKET, se ejecuta inmediatamente al precio actual
        if (orderData.type === 'MARKET') {
            orderData.price = marketData.close;
            orderData.status = 'FILLED';
        } else {
            // Si es LIMIT, se pone en estado NEW hasta que se ejecute
            orderData.status = 'NEW';
        }

        const newOrder = orderRepository.create(orderData);
        return await orderRepository.save(newOrder);
    }
}
