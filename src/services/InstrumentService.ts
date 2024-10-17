import { AppDataSource } from '../database/db';
import { Instrument } from '../entities/instrument.entity';

export class InstrumentService {
    static async searchInstruments(query: string) {
        const instrumentRepository = AppDataSource.getRepository(Instrument);

        return instrumentRepository
            .createQueryBuilder('instrument')
            .where('instrument.ticker ILIKE :query OR instrument.name ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
}
