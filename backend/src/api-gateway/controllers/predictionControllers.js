import BDLOBPredictionService from '../../services/predictService/BDLOBPredictionService.js';

export const makePrediction = async (req, res) => {
    try {
        const { lobData } = req.body;
        
        if (!lobData) {
            return res.status(400).json({ error: 'LOB data is required' });
        }

        const prediction = await BDLOBPredictionService.predict(lobData);
        res.json(prediction);
    } catch (error) {
        console.error('Error making prediction:', error);
        res.status(500).json({ error: 'Failed to make prediction' });
    }
};
