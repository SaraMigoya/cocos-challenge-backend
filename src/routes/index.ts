import { Router } from 'express';
import portfolioRoutes from './portfolioRoutes';
import instrumentRoutes from './instrumentRoutes';
import orderRoutes from './orderRoutes';

const router = Router();

router.use('/portfolio', portfolioRoutes);
router.use('/instruments', instrumentRoutes);
router.use('/orders', orderRoutes);

export default router;
