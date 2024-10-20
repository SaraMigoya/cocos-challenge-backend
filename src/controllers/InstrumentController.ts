import { NextFunction, Request, Response } from 'express';
import { InstrumentService } from '../services/InstrumentService';

export class InstrumentController {
    static async searchInstruments(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { query } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        try {
            const instruments = await InstrumentService.searchInstruments(query as string, page, limit);
            res.status(200).json(instruments);
        } catch (error) {
            next(error);
        }
    }
}

