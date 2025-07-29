import express from 'express';
import { getBTCUSDTPrice, streamBTCUSDTPrice } from '../../services/collectDataService/binanceService.js';

const router = express.Router();

router.get('/btc', getBTCUSDTPrice);
router.get('/btc/stream', streamBTCUSDTPrice);


export default router;