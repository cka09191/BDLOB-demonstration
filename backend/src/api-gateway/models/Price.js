import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

const Price = mongoose.model("Price", priceSchema);

export default Price;