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


    async repeatPrediction() {
        if (!this.isRunning) return;

        try {
            // Get prediction from the real prediction service
            const predictionResult = await makePrediction();
            
            if (!predictionResult) {
                console.error('No prediction result received from prediction service');
                return;
            }
            
            // Debug: Log the exact prediction result received
            console.log('🔍 Raw prediction result from model:', JSON.stringify(predictionResult, null, 2));
            
            // Check if there's an error in the prediction result
            if (predictionResult.error) {
                console.error('Prediction service error:', predictionResult.error);
                // Don't skip completely, but wait longer before retrying
                if (this.isRunning) {
                    setTimeout(() => this.repeatPrediction(), this.predictionInterval * 2);
                }
                return;
            }
            
            // Convert prediction_class to direction string
            let direction;
            if (typeof predictionResult.prediction_class === 'number') {
                // Real BDLOB model mapping: 0 = down, 1 = neutral, 2 = up
                switch (predictionResult.prediction_class) {
                    case 0:
                        direction = 'down';
                        break;
                    case 1:
                        // For neutral, you can decide how to handle:
                        // Option 1: Treat as down (conservative approach)
                        direction = 'down';
                        break;
                        // Option 2: Could be based on confidence or other logic
                        // direction = predictionResult.confidence > 0.6 ? 'up' : 'down';
                    case 2:
                        direction = 'up';
                        break;
                    default:
                        console.warn(`Unknown prediction class: ${predictionResult.prediction_class}`);
                        direction = 'down'; // conservative fallback
                }
            } else {
                console.error('Invalid prediction result format - missing prediction_class:', predictionResult);
                // Try again with longer delay
                if (this.isRunning) {
                    setTimeout(() => this.repeatPrediction(), this.predictionInterval * 2);
                }
                return;
            }
            
            // Validate required fields from real prediction
            if (typeof predictionResult.confidence !== 'number' || 
                !Array.isArray(predictionResult.probabilities) || 
                predictionResult.probabilities.length !== 3) {
                console.error('Invalid prediction result format - missing confidence or probabilities:', predictionResult);
                // Try again with longer delay
                if (this.isRunning) {
                    setTimeout(() => this.repeatPrediction(), this.predictionInterval * 2);
                }
                return;
            }
            
            const prediction = {
                timestamp: Date.now(),
                prediction: direction,
                confidence: predictionResult.confidence,
                weights: predictionResult.probabilities
            };  

            await this.savePrediction(prediction);
            console.log('Real prediction made:', {
                direction: prediction.prediction,
                confidence: prediction.confidence,
                probabilities: prediction.weights,
                timestamp: new Date(prediction.timestamp).toISOString()
            });
        } catch (error) {
            console.error('Error making real prediction:', error);
        }
        
        // Use setTimeout to repeat the prediction after the specified interval
        if (this.isRunning) {
            setTimeout(() => this.repeatPrediction(), this.predictionInterval);
        }
    }

    async savePrediction(prediction) {
        try {
            const predictionDoc = new Prediction(prediction);
            await predictionDoc.save();
            console.log(`✓ Prediction saved at ${new Date(prediction.timestamp).toISOString()}`);
        } catch (error) {
            console.error('Error saving prediction:', error);
            throw error; // Re-throw so the caller can handle it
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
