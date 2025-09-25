import express from 'express';
import { getSalesByPeriod, insertSalesData } from '../controllers/SalesController.js';

const router = express.Router();

// Routes
router.get('/', getSalesByPeriod);
router.post('/', insertSalesData);

export default router;