import BDLOBPredictionService from '../../services/predictService/BDLOBPredictionService.js';
import { getLatest4500 } from '../controllers/LOBControllers.js';

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
        // prediction needs book data only
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
