import mongoose from "mongoose";
/*
example of Prediction
{
    "timestamp": 1700000000,
    "prediction": "up" // or "down",
    "confidence": 0.85,
    "weights": [0.1, 0.3, 0.5]
}
*/
const PredictionSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Number,
            required: true,
        },
        prediction: {
            type: JSON,
            // enum: ['up', 'down'],
            required: true,
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
        },
        weights: {
            type: [Number],
            required: true,
        }
    }
)

const Prediction = mongoose.model("Prediction", PredictionSchema);

export default Prediction;