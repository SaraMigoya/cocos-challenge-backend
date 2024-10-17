import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from '../services/portfolioService';

export class PortfolioController {
    static async getPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userId = parseInt(req.params.id);
        try {
            const portfolio = await PortfolioService.getPortfolio(userId);
            res.status(200).json(portfolio);
        } catch (error) {
            next(error);
        }
    }
}
