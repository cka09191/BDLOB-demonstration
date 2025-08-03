import express from 'express';
import { 
    makePrediction, 
    // predictCurrentLOB, 
    // getRecentPredictions, 
    // getPredictionServiceStatus 
} from '../controllers/predictionControllers.js';

const router = express.Router();

router.post('/predict', makePrediction);

export default router;