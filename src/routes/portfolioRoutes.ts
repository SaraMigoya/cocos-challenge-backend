import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController';

const router = Router();

router.get('/:id', PortfolioController.getPortfolio);

export default router;
