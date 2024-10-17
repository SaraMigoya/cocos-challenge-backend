import express from 'express';
import { AppDataSource } from '../src/database/db';
import 'reflect-metadata';
import dotenv from 'dotenv';
import portfolioRoutes from './routes/portfolioRoutes';
import instrumentRoutes from './routes/instrumentRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();


const app = express();
app.use(express.json());
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/orders', orderRoutes);

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(error => console.log('Database connection error:', error));

app.get('/', (req, res) => {
    res.send('API for Portfolio Management');
});

export default app;