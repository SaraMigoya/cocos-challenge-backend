import { Router } from 'express';
import { InstrumentController } from '../controllers/InstrumentController';

const router = Router();

// Ruta para buscar instrumentos
router.get('/search', InstrumentController.searchInstruments);

export default router;
