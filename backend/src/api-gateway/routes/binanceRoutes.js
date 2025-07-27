import express from 'express';
import { getBTCUSDTPrice, streamBTCUSDTPrice } from '../controllers/binanceControllers.js';

const router = express.Router();

router.get('/btc', getBTCUSDTPrice);
router.get('/btc/stream', streamBTCUSDTPrice);


export default router;