import Prediction from '../../api-gateway/models/Prediction.js';
import { makePrediction } from '../../api-gateway/controllers/predictionControllers.js';

class predictionCollectorService {
    constructor() {
        this.ws = null;
        this.isRunning = false;
        this.predictionInterval = 10_000;
    }

    start() {
        if (this.isRunning) {
            console.log('Prediction Collector Service is already running');
            return;
        }

        console.log('Starting Prediction Collector Service...');
        this.isRunning = true;

        // Start the prediction collection process
        this.repeatPrediction();
        console.log('✓ Prediction Collector Service started');


    }

    stop() {
        console.log('Stopping Prediction Collector Service...');
        this.isRunning = false;
        
    }


    repeatPrediction() {
        if (!this.isRunning) return;

        // Simulate prediction logic
        // const prediction = {
        //     timestamp: Date.now(),
        //     prediction: Math.random() > 0.5 ? 'up' : 'down', // Random prediction for demonstration
        //     confidence: Math.random(), // Random confidence between 0 and 1
        //     weights: Array.from({ length: 3 }, () => Math.random()) // Random weights
        // };

        const prediction = {
            timestamp: Date.now(),
            prediction: makePrediction(),
            confidence: Math.random(),
            weights: Array.from({ length: 3 }, () => Math.random())
        };  

        this.savePrediction(prediction);
        console.log('Prediction made:', prediction);
        console.log('prediction:', prediction.prediction);
        console.log('type of prediction:', typeof prediction.prediction);
        console.log(`Prediction made at ${new Date(prediction.timestamp).toISOString()}: ${prediction.prediction} with confidence ${prediction.confidence}`);
        // Use setTimeout to repeat the prediction after the specified interval
        this.isRunning && setTimeout(() => this.repeatPrediction(), this.predictionInterval);
        
    }

    savePrediction(prediction) {
        try {
            const predictionDoc = new Prediction(prediction); // Assuming Prediction model can be used for predictions
            predictionDoc.save()
                .then(() => console.log(`Prediction saved at ${new Date(prediction.timestamp).toISOString()}`))
                .catch(error => console.error('Error saving prediction:', error));
        } catch (error) {
            console.error('Error creating prediction document:', error);
        }
        
    }

    

    // Method to get current order book status
    getStatus() {
        return {
            isRunning: this.isRunning,
        };
    }
}

// Create singleton instance
const PredictionCollectorService = new predictionCollectorService();

export default PredictionCollectorService;
