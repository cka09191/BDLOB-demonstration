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
        const last_450s_predictions = await Prediction.find(
            { timestamp: { $gte: timestamp_last450s } },
            { timestamp: 1, prediction: 1, confidence: 1, weights: 1, _id: 0 }
        )
        .sort({ timestamp: -1 })
        .lean();

        if (!last_450s_predictions || last_450s_predictions.length === 0) {
            if (res === undefined) {
                return null;
            }
            return res.status(404).json({ error: 'No predictions found in the last 450 seconds' });
        }

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
