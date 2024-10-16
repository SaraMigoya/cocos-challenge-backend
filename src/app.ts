import express from 'express';
import { AppDataSource } from '../src/database/db';
import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(error => console.log('Database connection error:', error));

app.get('/', (req, res) => {
    res.send('API for Portfolio Management');
});

export default app;
