

import { DataSource } from 'typeorm';
import { User, Instrument, Order, MarketData } from '../entities';
import dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';


dotenv.config();
const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } = process.env;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: parseInt(POSTGRES_PORT || '5432'),
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [User, Instrument, Order, MarketData],
    namingStrategy: new SnakeNamingStrategy(),
});
