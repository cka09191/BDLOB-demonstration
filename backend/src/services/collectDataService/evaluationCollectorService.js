import Evaluation from '../../api-gateway/models/Evaluation.js';
import Prediction from '../../api-gateway/models/Prediction.js';
import LOB from '../../api-gateway/models/LOB.js';

class EvaluationCollectorService {
    constructor() {
        this.isRunning = false;
        this.evaluationInterval = 30_000; // 1 minute interval
        this.lookbackTime = 420_000; // Look back 7 minutes for predictions to evaluate
    }

    start() {
        if (this.isRunning) {
            console.log('Evaluation Collector Service is already running');
            return;
        }

        console.log('Starting Evaluation Collector Service...');
        this.isRunning = true;

        // Start the evaluation process
        this.repeatEvaluation();
        console.log('✓ Evaluation Collector Service started');
    }

    stop() {
        console.log('Stopping Evaluation Collector Service...');
        this.isRunning = false;
    }

    async repeatEvaluation() {
        if (!this.isRunning) return;

        try {
            await this.evaluatePredictions();
        } catch (error) {
            console.error('Error in evaluation process:', error);
        }

        // Schedule next evaluation
        if (this.isRunning) {
            setTimeout(() => this.repeatEvaluation(), this.evaluationInterval);
        }
    }

    async evaluatePredictions() {
        try {
            const now = Date.now();
            const evaluationStartTime = now - this.lookbackTime;
            const evaluationEndTime = now - this.evaluationInterval; // Don't evaluate too recent predictions

            // Find predictions that need to be evaluated
            const predictionsToEvaluate = await Prediction.find({
                timestamp: {
                    $gte: evaluationStartTime,
                    $lte: evaluationEndTime
                }
            }).lean();

            if (!predictionsToEvaluate || predictionsToEvaluate.length === 0) {
                console.log('No predictions to evaluate at this time');
                return;
            }

            console.log(`Evaluating ${predictionsToEvaluate.length} predictions...`);

            for (const prediction of predictionsToEvaluate) {
                // Check if this prediction has already been evaluated
                const existingEvaluation = await Evaluation.findOne({
                    predictionId: prediction._id
                });

                if (existingEvaluation) {
                    continue; // Skip already evaluated predictions
                }

                await this.evaluateSinglePrediction(prediction);
            }

            console.log(`✓ Completed evaluation of ${predictionsToEvaluate.length} predictions`);
        } catch (error) {
            console.error('Error evaluating predictions:', error);
        }
    }

    async evaluateSinglePrediction(prediction) {
        try {
            const predictionTime = prediction.timestamp;
            const evaluationTime = predictionTime + this.evaluationInterval;

            // Get LOB data at prediction time and evaluation time
            const lobAtPrediction = await this.getLOBAtTime(predictionTime);
            const lobAtEvaluation = await this.getLOBAtTime(evaluationTime);

            if (!lobAtPrediction || !lobAtEvaluation) {
                console.log(`Skipping evaluation for prediction ${prediction._id}: Missing LOB data`);
                return;
            }

            // Calculate mid prices
            const priceAtPrediction = this.calculateMidPrice(lobAtPrediction.book);
            const priceAfterInterval = this.calculateMidPrice(lobAtEvaluation.book);

            if (priceAtPrediction === null || priceAfterInterval === null) {
                console.log(`Skipping evaluation for prediction ${prediction._id}: Invalid price data`);
                return;
            }

            // Determine actual direction
            const priceChange = priceAfterInterval - priceAtPrediction;
            const actualDirection = priceChange >= 0 ? 'up' : 'down';
            const isCorrect = prediction.prediction === actualDirection;

            const priceChangePercent = priceAtPrediction !== 0 ? (priceChange / priceAtPrediction) : 0;

            // Create evaluation record
            const evaluation = new Evaluation({
                timestamp: Date.now(),
                predictionId: prediction._id,
                predictedDirection: prediction.prediction,
                actualDirection,
                isCorrect,
                priceAtPrediction,
                priceAfterInterval,
                priceChange,
                priceChangePercent,
                confidence: prediction.confidence,
                evaluationInterval: this.evaluationInterval
            });

            await evaluation.save();

            console.log(`✓ Evaluation saved for prediction ${prediction._id}: ${prediction.prediction} -> ${actualDirection} (${isCorrect ? 'CORRECT' : 'INCORRECT'})`);
        } catch (error) {
            console.error(`Error evaluating prediction ${prediction._id}:`, error);
        }
    }

    async getLOBAtTime(timestamp) {
        try {
            // Find the closest LOB data to the given timestamp (within a reasonable window)
            const timeWindow = 30_000; // 30 seconds window

            const lob = await LOB.findOne({
                timestamp: {
                    $gte: timestamp - timeWindow,
                    $lte: timestamp + timeWindow
                }
            })
            .sort({ timestamp: 1 }) // Get the closest one
            .lean();

            return lob;
        } catch (error) {
            console.error('Error getting LOB at time:', error);
            return null;
        }
    }

    calculateMidPrice(book) {
        try {
            if (!book || !Array.isArray(book) || book.length === 0) {
                return null;
            }

            // Get the best bid and ask from the first level
            // book format: [bid_price, bid_volume, ask_price, ask_volume]
            const firstLevel = book[0];
            if (!firstLevel || firstLevel.length < 4) {
                return null;
            }

            const bestBid = firstLevel[0];
            const bestAsk = firstLevel[2];

            if (typeof bestBid !== 'number' || typeof bestAsk !== 'number') {
                return null;
            }

            // Calculate mid price
            const midPrice = (bestBid + bestAsk) / 2;
            return midPrice;
        } catch (error) {
            console.error('Error calculating mid price:', error);
            return null;
        }
    }

    // Method to get current service status
    getStatus() {
        return {
            isRunning: this.isRunning,
            evaluationInterval: this.evaluationInterval,
            lookbackTime: this.lookbackTime
        };
    }

    // Method to update evaluation interval
    setEvaluationInterval(intervalMs) {
        this.evaluationInterval = intervalMs;
        console.log(`Evaluation interval updated to ${intervalMs}ms`);
    }

    // Method to update lookback time
    setLookbackTime(lookbackMs) {
        this.lookbackTime = lookbackMs;
        console.log(`Lookback time updated to ${lookbackMs}ms`);
    }
}

// Create singleton instance
const evaluationCollectorService = new EvaluationCollectorService();

export default evaluationCollectorService;
