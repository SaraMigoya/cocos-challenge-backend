import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

const router = Router();

// Ruta para crear una nueva orden
router.post('/', OrderController.placeOrder);

export default router;
