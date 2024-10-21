import { AppDataSource } from '../src/database/db';
import app from '../src/app';
import request from 'supertest';
import { User } from '../src/entities/index';


describe('Test funcional para enviar una orden', () => {
    const UserRepository = AppDataSource.getRepository(User);
    beforeAll(async () => {
        // Inicializar la base de datos para pruebas
        await AppDataSource.initialize();
    });

    afterAll(async () => {
        // Cerrar conexión después de las pruebas
        await AppDataSource.destroy();
    });

    it('debería crear una orden de tipo MARKET correctamente', async () => {
        // Crear un usuario de prueba
        const testUser = await UserRepository.save({
            email: 'emiliano@test.com',
            accountNumber: '10001',
            id: 1
        });

        // Crear una solicitud para enviar una orden de tipo MARKET
        const response = await request(app)
            .post('/api/orders')
            .send({
                userId: testUser.id,
                instrumentId: 14,
                side: "BUY",
                type: "MARKET",
                size: 54
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.status).toBe('FILLED');
    });

    it('debería rechazar una orden si no hay suficiente dinero', async () => {
        const testUser = await UserRepository.save({
            email: 'emiliano@test.com',
            accountNumber: '10001',
            id: 1
        });
        const response = await request(app)
            .post('/api/orders')
            .send({
                userId: testUser.id,
                instrumentId: 35,
                side: 'BUY',
                type: 'MARKET',
                size: 10000 // Un tamaño grande para provocar insuficiencia de fondos
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'REJECTED');
        expect(response.body.message).toBe('Not enough cash to complete the BUY order');
    });
});
