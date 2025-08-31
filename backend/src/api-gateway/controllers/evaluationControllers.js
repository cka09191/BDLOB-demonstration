import Evaluation from '../models/Evaluation.js';
import Prediction from '../models/Prediction.js';

// Get evaluation statistics for a given time period
export const getEvaluationStats = async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const timeLimit = Date.now() - (hours * 60 * 60 * 1000);

        const evaluations = await Evaluation.find({
            timestamp: { $gte: timeLimit }
        }).lean();

        if (!evaluations || evaluations.length === 0) {
            return res.json({
                totalPredictions: 0,
                correctPredictions: 0,
                accuracy: 0,
                avgConfidence: 0,
                upPredictions: { total: 0, correct: 0, accuracy: 0 },
                downPredictions: { total: 0, correct: 0, accuracy: 0 },
                avgPriceChange: 0,
                avgPriceChangePercent: 0
            });
        }

        const totalPredictions = evaluations.length;
        const correctPredictions = evaluations.filter(e => e.isCorrect).length;
        const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

        const upPredictions = evaluations.filter(e => e.predictedDirection === 'up');
        const downPredictions = evaluations.filter(e => e.predictedDirection === 'down');

        const upCorrect = upPredictions.filter(e => e.isCorrect).length;
        const downCorrect = downPredictions.filter(e => e.isCorrect).length;

        const avgConfidence = evaluations.reduce((sum, e) => sum + e.confidence, 0) / totalPredictions;
        const avgPriceChange = evaluations.reduce((sum, e) => sum + Math.abs(e.priceChange), 0) / totalPredictions;
        const avgPriceChangePercent = evaluations.reduce((sum, e) => sum + Math.abs(e.priceChangePercent), 0) / totalPredictions;

        const stats = {
            totalPredictions,
            correctPredictions,
            accuracy: Math.round(accuracy * 100) / 100,
            avgConfidence: Math.round(avgConfidence * 1000) / 1000,
            upPredictions: {
                total: upPredictions.length,
                correct: upCorrect,
                accuracy: upPredictions.length > 0 ? Math.round((upCorrect / upPredictions.length) * 10000) / 100 : 0
            },
            downPredictions: {
                total: downPredictions.length,
                correct: downCorrect,
                accuracy: downPredictions.length > 0 ? Math.round((downCorrect / downPredictions.length) * 10000) / 100 : 0
            },
            avgPriceChange: Math.round(avgPriceChange * 100) / 100,
            avgPriceChangePercent: Math.round(avgPriceChangePercent * 10000) / 100,
            timeRangeHours: hours
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting evaluation stats:', error);
        res.status(500).json({ error: 'Failed to get evaluation statistics' });
    }
};

// Get recent evaluations with pagination
export const getRecentEvaluations = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const evaluations = await Evaluation.find()
            .populate('predictionId', 'timestamp weights')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();

        const total = await Evaluation.countDocuments();

        res.json({
            evaluations,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error getting recent evaluations:', error);
        res.status(500).json({ error: 'Failed to get recent evaluations' });
    }
};

// Get accuracy trend over time (hourly breakdown)
export const getAccuracyTrend = async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const timeLimit = Date.now() - (hours * 60 * 60 * 1000);

        const trend = await Evaluation.aggregate([
            {
                $match: {
                    timestamp: { $gte: timeLimit }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:00",
                            date: { $toDate: "$timestamp" }
                        }
                    },
                    total: { $sum: 1 },
                    correct: {
                        $sum: {
                            $cond: ["$isCorrect", 1, 0]
                        }
                    },
                    avgConfidence: { $avg: "$confidence" }
                }
            },
            {
                $project: {
                    hour: "$_id",
                    total: 1,
                    correct: 1,
                    accuracy: {
                        $multiply: [
                            { $divide: ["$correct", "$total"] },
                            100
                        ]
                    },
                    avgConfidence: { $round: ["$avgConfidence", 3] }
                }
            },
            {
                $sort: { hour: 1 }
            }
        ]);

        res.json(trend);
    } catch (error) {
        console.error('Error getting accuracy trend:', error);
        res.status(500).json({ error: 'Failed to get accuracy trend' });
    }
};

// Get confidence vs accuracy correlation
export const getConfidenceAccuracy = async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const timeLimit = Date.now() - (hours * 60 * 60 * 1000);

        const correlationData = await Evaluation.aggregate([
            {
                $match: {
                    timestamp: { $gte: timeLimit }
                }
            },
            {
                $bucket: {
                    groupBy: "$confidence",
                    boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
                    default: "other",
                    output: {
                        total: { $sum: 1 },
                        correct: {
                            $sum: {
                                $cond: ["$isCorrect", 1, 0]
                            }
                        },
                        avgConfidence: { $avg: "$confidence" }
                    }
                }
            },
            {
                $project: {
                    confidenceRange: "$_id",
                    total: 1,
                    correct: 1,
                    accuracy: {
                        $multiply: [
                            { $divide: ["$correct", "$total"] },
                            100
                        ]
                    },
                    avgConfidence: { $round: ["$avgConfidence", 3] }
                }
            }
        ]);

        res.json(correlationData);
    } catch (error) {
        console.error('Error getting confidence-accuracy correlation:', error);
        res.status(500).json({ error: 'Failed to get confidence-accuracy correlation' });
    }
};

// Flush old evaluations (keep only recent ones)
export const flushOldEvaluations = async (req, res) => {
    try {
        const { keepHours = 168 } = req.body; // Keep 1 week by default
        const cutoffTime = Date.now() - (keepHours * 60 * 60 * 1000);

        const result = await Evaluation.deleteMany({
            timestamp: { $lt: cutoffTime }
        });

        res.json({
            message: `Deleted ${result.deletedCount} old evaluations`,
            deletedCount: result.deletedCount,
            cutoffTime: new Date(cutoffTime).toISOString()
        });
    } catch (error) {
        console.error('Error flushing old evaluations:', error);
        res.status(500).json({ error: 'Failed to flush old evaluations' });
    }
};
