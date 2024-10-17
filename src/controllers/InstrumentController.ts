import { NextFunction, Request, Response } from 'express';
import { InstrumentService } from '../services/InstrumentService';

export class InstrumentController {
    static async searchInstruments(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { query } = req.query;
        try {
            const instruments = await InstrumentService.searchInstruments(query as string);
            res.status(200).json(instruments);
        } catch (error) {
            next(error);
        }
    }
}
