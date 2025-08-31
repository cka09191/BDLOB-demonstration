import express from 'express';
import serviceManager from '../../services/serviceManager.js';
import Prediction from '../models/Prediction.js';
import Evaluation from '../models/Evaluation.js';
import LOB from '../models/LOB.js';

const router = express.Router();

// Get system status and health
router.get('/status', async (req, res) => {
    try {
        // Get service statuses
        const servicesStatus = serviceManager.getServicesStatus();
        
        // Get recent data counts
        const now = Date.now();
        const last10Minutes = now - (10 * 60 * 1000);
        
        const [
            recentLOBCount,
            recentPredictionCount,
            recentEvaluationCount,
            totalPredictions,
            totalEvaluations
        ] = await Promise.all([
            LOB.countDocuments({ timestamp: { $gte: last10Minutes } }),
            Prediction.countDocuments({ timestamp: { $gte: last10Minutes } }),
            Evaluation.countDocuments({ timestamp: { $gte: last10Minutes } }),
            Prediction.countDocuments(),
            Evaluation.countDocuments()
        ]);
        
        // Get latest prediction and evaluation
        const [latestPrediction, latestEvaluation] = await Promise.all([
            Prediction.findOne({}, { timestamp: 1, prediction: 1, confidence: 1 })
                .sort({ timestamp: -1 })
                .lean(),
            Evaluation.findOne({}, { timestamp: 1, isCorrect: 1, predictedDirection: 1, actualDirection: 1 })
                .sort({ timestamp: -1 })
                .lean()
        ]);
        
        const systemStatus = {
            timestamp: new Date().toISOString(),
            services: servicesStatus,
            dataHealth: {
                recentLOBData: recentLOBCount,
                recentPredictions: recentPredictionCount,
                recentEvaluations: recentEvaluationCount,
                totalPredictions,
                totalEvaluations
            },
            latest: {
                prediction: latestPrediction ? {
                    timestamp: new Date(latestPrediction.timestamp).toISOString(),
                    direction: latestPrediction.prediction,
                    confidence: latestPrediction.confidence
                } : null,
                evaluation: latestEvaluation ? {
                    timestamp: new Date(latestEvaluation.timestamp).toISOString(),
                    predicted: latestEvaluation.predictedDirection,
                    actual: latestEvaluation.actualDirection,
                    correct: latestEvaluation.isCorrect
                } : null
            },
            system: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version
            }
        };
        
        res.json(systemStatus);
    } catch (error) {
        console.error('Error getting system status:', error);
        res.status(500).json({ error: 'Failed to get system status' });
    }
});

// Get real-time accuracy over last N predictions
router.get('/live-accuracy/:count?', async (req, res) => {
    try {
        const count = parseInt(req.params.count) || 100;
        
        const recentEvaluations = await Evaluation.find({})
            .sort({ timestamp: -1 })
            .limit(count)
            .select('isCorrect predictedDirection timestamp')
            .lean();
            
        if (recentEvaluations.length === 0) {
            return res.json({
                accuracy: 0,
                total: 0,
                correct: 0,
                message: 'No evaluations available yet'
            });
        }
        
        const correct = recentEvaluations.filter(e => e.isCorrect).length;
        const accuracy = (correct / recentEvaluations.length) * 100;
        
        const upPredictions = recentEvaluations.filter(e => e.predictedDirection === 'up');
        const downPredictions = recentEvaluations.filter(e => e.predictedDirection === 'down');
        
        res.json({
            accuracy: Math.round(accuracy * 100) / 100,
            total: recentEvaluations.length,
            correct,
            breakdown: {
                up: {
                    total: upPredictions.length,
                    correct: upPredictions.filter(e => e.isCorrect).length
                },
                down: {
                    total: downPredictions.length,
                    correct: downPredictions.filter(e => e.isCorrect).length
                }
            },
            timeRange: `Last ${count} predictions`
        });
    } catch (error) {
        console.error('Error getting live accuracy:', error);
        res.status(500).json({ error: 'Failed to get live accuracy' });
    }
});

export default router;
