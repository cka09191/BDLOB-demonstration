import express from 'express';
import { 
    getBTCUSDTPrice, 
    streamBTCUSDTPrice, 
    getFullOrderBook, 
    getCurrentLOBFromCollector 
} from '../../services/collectDataService/binanceService.js';

const router = express.Router();

router.get('/btc', getBTCUSDTPrice);
router.get('/btc/stream', streamBTCUSDTPrice);
router.get('/orderbook', getFullOrderBook);
router.get('/lob/current', getCurrentLOBFromCollector);

export default router;