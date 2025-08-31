import mongoose from "mongoose";

/*
example of Evaluation
{
    "timestamp": 1700000000,
    "predictionId": "ObjectId", // Reference to the prediction
    "predictedDirection": "up", // or "down" - what was predicted
    "actualDirection": "up", // or "down" - what actually happened
    "isCorrect": true, // whether prediction was correct
    "priceAtPrediction": 100.5, // mid price when prediction was made
    "priceAfterInterval": 101.2, // mid price after evaluation interval
    "priceChange": 0.7, // absolute price change
    "priceChangePercent": 0.007, // percentage change
    "confidence": 0.85, // confidence from original prediction
    "evaluationInterval": 60000 // time interval used for evaluation (ms)
}
*/
const EvaluationSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Number,
            required: true,
            index: true,
        },
        predictionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Prediction',
            required: true,
            index: true,
        },
        predictedDirection: {
            type: String,
            enum: ['up', 'down'],
            required: true,
        },
        actualDirection: {
            type: String,
            enum: ['up', 'down'],
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
            index: true, // For easy filtering of correct/incorrect predictions
        },
        priceAtPrediction: {
            type: Number,
            required: true,
        },
        priceAfterInterval: {
            type: Number,
            required: true,
        },
        priceChange: {
            type: Number,
            required: true,
        },
        priceChangePercent: {
            type: Number,
            required: true,
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
        },
        evaluationInterval: {
            type: Number,
            required: true,
            default: 60000, // 1 minute default
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Create compound indexes for efficient queries
EvaluationSchema.index({ timestamp: -1 });
EvaluationSchema.index({ isCorrect: 1, timestamp: -1 });
EvaluationSchema.index({ predictionId: 1, timestamp: -1 });

const Evaluation = mongoose.model("Evaluation", EvaluationSchema);

export default Evaluation;
