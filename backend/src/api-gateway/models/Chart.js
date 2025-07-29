import mongoose from "mongoose";

const chartSchema = new mongoose.Schema(
    {
        title: {
            type: Number,
            required: true,
        },
        content: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

const Chart = mongoose.model("Chart", chartSchema);

export default Chart;