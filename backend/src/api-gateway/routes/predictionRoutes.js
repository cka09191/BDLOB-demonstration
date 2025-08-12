import express from 'express';
import { 
    makePrediction, 
    getLatest450sPrediction
} from '../controllers/predictionControllers.js';

const router = express.Router();

router.post('/predict', makePrediction);
router.get('/latest-450s', getLatest450sPrediction);


export default router;