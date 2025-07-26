import express from 'express';
import { getBTCUSDTPrice } from '../controllers/binanceControllers.js';

const router = express.Router();

router.get('/btc', getBTCUSDTPrice);

export default router;