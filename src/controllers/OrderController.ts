import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';

export class OrderController {
    static async placeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await OrderService.placeOrder(req.body);
            res.status(201).json(order);
        } catch (error) {
            next(error);
        }
    }
}
