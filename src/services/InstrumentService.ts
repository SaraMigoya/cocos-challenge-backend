import { AppDataSource } from '../database/db';
import { Instrument } from '../entities/instrument.entity';

export class InstrumentService {
    static async searchInstruments(query: string, page: number = 1, limit: number = 10) {
        const instrumentRepository = AppDataSource.getRepository(Instrument);
        const removeBlankSpaces = query.trim();
        if (!removeBlankSpaces) {
            return [];
        }

        const offset = (page - 1) * limit;

        return instrumentRepository
            .createQueryBuilder('instrument')
            .where('instrument.ticker ILIKE :query OR instrument.name ILIKE :query', { query: `%${removeBlankSpaces}%` })
            .offset(offset)
            .limit(limit)
            .getMany();
    }
}
