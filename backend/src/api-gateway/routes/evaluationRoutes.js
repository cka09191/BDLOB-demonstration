import express from 'express';
import {
    getEvaluationStats,
    getRecentEvaluations,
    getAccuracyTrend,
    getConfidenceAccuracy,
    flushOldEvaluations
} from '../controllers/evaluationControllers.js';

const router = express.Router();

// Get evaluation statistics
router.get('/stats', getEvaluationStats);

// Get recent evaluations with pagination
router.get('/recent', getRecentEvaluations);

// Get accuracy trend over time
router.get('/trend', getAccuracyTrend);

// Get confidence vs accuracy correlation
router.get('/confidence-accuracy', getConfidenceAccuracy);

// Flush old evaluations
router.delete('/flush-old', flushOldEvaluations);

export default router;