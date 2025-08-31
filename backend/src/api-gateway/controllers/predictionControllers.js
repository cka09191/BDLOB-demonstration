import BDLOBPredictionService from '../../services/predictService/BDLOBPredictionService.js';
import { getLatest4500 } from '../controllers/LOBControllers.js';
import Prediction from '../models/Prediction.js';

export const makePrediction = async (req, res) => {
    try {
        const lobData = await getLatest4500();

        if (!lobData) {
            if(res === undefined) {
                console.error('LOB data could not be retrieved');
                return null;
            }
            return res.status(400).json({ error: 'LOB data could not be retrieved' });
        }

        // Debug: Log the structure of the LOB data being sent to prediction
        console.log('LOB data for prediction:', {
            bookType: typeof lobData.book,
            bookLength: lobData.book ? lobData.book.length : 'N/A',
            firstItemType: lobData.book && lobData.book[0] ? typeof lobData.book[0] : 'N/A',
            firstItemLength: lobData.book && lobData.book[0] && lobData.book[0].length ? lobData.book[0].length : 'N/A',
            firstLevelSample: lobData.book && lobData.book[0] && lobData.book[0][0] ? lobData.book[0][0] : 'N/A'
        });

        const prediction = await BDLOBPredictionService.predict(lobData.book);
        if(res === undefined) {
            return prediction;
        }
        
        res.json(prediction);
    } catch (error) {
        console.error('Error making prediction:', error);
        if(res === undefined) {
            return null;
        }
        res.status(500).json({ error: 'Failed to make prediction' });
    }
};


export const getLatest450sPrediction = async (req, res) => {
    try {
        const timestamp_last450s = Date.now() - 450000; // 450 seconds in milliseconds
        
        // First, check if we have any predictions at all
        const totalPredictions = await Prediction.countDocuments();
        const recentPredictions = await Prediction.countDocuments({ timestamp: { $gte: timestamp_last450s } });
        
        console.log(`Prediction query debug: Total predictions in DB: ${totalPredictions}, Recent (last 450s): ${recentPredictions}`);
        
        // If no predictions at all, provide helpful debug info
        if (totalPredictions === 0) {
            const debugInfo = {
                error: 'No predictions found in database',
                totalPredictions: 0,
                suggestion: 'Check if prediction collector service is running and successfully making predictions',
                timestamp: new Date().toISOString()
            };
            
            if (res === undefined) {
                return debugInfo;
            }
            return res.status(404).json(debugInfo);
        }
        
        // If we have predictions but none recent, show the latest one for context
        if (recentPredictions === 0) {
            const latestPrediction = await Prediction.findOne({}, { timestamp: 1, prediction: 1, confidence: 1 })
                .sort({ timestamp: -1 })
                .lean();
                
            const timeSinceLatest = latestPrediction ? Date.now() - latestPrediction.timestamp : null;
            
            const debugInfo = {
                error: 'No predictions found in the last 450 seconds',
                totalPredictions,
                recentPredictions: 0,
                latestPrediction: latestPrediction ? {
                    timestamp: new Date(latestPrediction.timestamp).toISOString(),
                    prediction: latestPrediction.prediction,
                    confidence: latestPrediction.confidence,
                    ageSeconds: Math.floor(timeSinceLatest / 1000)
                } : null,
                suggestion: 'Predictions exist but are older than 450 seconds. Check prediction collector service.',
                timestamp: new Date().toISOString()
            };
            
            if (res === undefined) {
                return debugInfo;
            }
            return res.status(404).json(debugInfo);
        }
        
        // Fetch recent predictions
        const last_450s_predictions = await Prediction.find(
            { timestamp: { $gte: timestamp_last450s } },
            { timestamp: 1, prediction: 1, confidence: 1, weights: 1, _id: 0 }
        )
        .sort({ timestamp: -1 })
        .lean();

        last_450s_predictions.reverse();

        const formattedPredictions = {
            timestamp_first: last_450s_predictions[0].timestamp,
            timestamp_last: last_450s_predictions[last_450s_predictions.length - 1].timestamp,
            predictions: last_450s_predictions,
            count: last_450s_predictions.length,
        };

        if (res === undefined) {
            return formattedPredictions;
        }
        res.status(200).json(formattedPredictions);
    } catch (error) {
        console.error('Error fetching latest 450s prediction:', error);
        if (res === undefined) {
            return null;
        }
        res.status(500).json({ error: 'Failed to fetch latest 450s prediction' });
    }
}

export const flushExceptLatest450sPrediction = async (req, res) => {
    try {
        await Prediction.deleteMany({ timestamp: { $lt: Date.now() - 450000 } });
        res.status(204).send();
    } catch (error) {
        console.error('Error flushing except latest 450s prediction:', error);
        res.status(500).json({ error: 'Failed to flush except latest 450s prediction' });
    }
};

// Debug endpoint to check prediction system status
export const getPredictionSystemStatus = async (req, res) => {
    try {
        const now = Date.now();
        const last5Minutes = now - (5 * 60 * 1000);
        const last1Hour = now - (60 * 60 * 1000);
        
        const [
            totalPredictions,
            last5MinPredictions,
            lastHourPredictions,
            latestPrediction
        ] = await Promise.all([
            Prediction.countDocuments(),
            Prediction.countDocuments({ timestamp: { $gte: last5Minutes } }),
            Prediction.countDocuments({ timestamp: { $gte: last1Hour } }),
            Prediction.findOne({}, { timestamp: 1, prediction: 1, confidence: 1 })
                .sort({ timestamp: -1 })
                .lean()
        ]);
        
        const status = {
            timestamp: new Date().toISOString(),
            predictions: {
                total: totalPredictions,
                last5Minutes: last5MinPredictions,
                lastHour: lastHourPredictions
            },
            latest: latestPrediction ? {
                timestamp: new Date(latestPrediction.timestamp).toISOString(),
                prediction: latestPrediction.prediction,
                confidence: latestPrediction.confidence,
                ageMinutes: Math.floor((now - latestPrediction.timestamp) / (60 * 1000))
            } : null,
            system: {
                isHealthy: last5MinPredictions > 0,
                message: last5MinPredictions > 0 
                    ? 'Prediction system is actively making predictions' 
                    : totalPredictions === 0 
                        ? 'No predictions found. Prediction collector may not be running.'
                        : 'Predictions exist but none recent. Check prediction collector service.'
            }
        };
        
        res.json(status);
    } catch (error) {
        console.error('Error getting prediction system status:', error);
        res.status(500).json({ error: 'Failed to get prediction system status' });
    }
};
