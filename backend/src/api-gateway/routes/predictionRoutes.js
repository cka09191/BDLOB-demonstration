import express from 'express';
import { 
    makePrediction, 
    getLatest450sPrediction,
    flushExceptLatest450sPrediction,
    getPredictionSystemStatus
} from '../controllers/predictionControllers.js';

const router = express.Router();

router.post('/predict', makePrediction);
router.get('/latest-450s', getLatest450sPrediction);
router.delete('/latest-450s', flushExceptLatest450sPrediction);
router.get('/status', getPredictionSystemStatus);


export default router;