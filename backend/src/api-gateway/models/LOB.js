import mongoose from "mongoose";
/*
example of LOB
{
    "timestamp": 1700000000,
    "book": [
        [100.0, 10, 101.0, 15],     // [bid price, bid volume, ask price, ask volume] #1
        [100.5, 20, 101.5, 25],     // #2
        [101.0, 30, 102.0, 35],     // #3
        [101.5, 40, 102.5, 45],     // #4
        [102.0, 50, 103.0, 55],     // #5
        [102.5, 60, 103.5, 65],     // #6
        [103.0, 70, 104.0, 75],     // #7
        [103.5, 80, 104.5, 85],     // #8
        [104.0, 90, 105.0, 95],     // #9
        [104.5, 100, 105.5, 105],   // #10
        [105.0, 110, 106.0, 115],   // #11
        [105.5, 120, 106.5, 125],   // #12
        [106.0, 130, 107.0, 135],   // #13
        [106.5, 140, 107.5, 145],   // #14
        [107.0, 150, 108.0, 155],   // #15
        [107.5, 160, 108.5, 165],   // #16
        [108.0, 170, 109.0, 175],   // #17
        [108.5, 180, 109.5, 185],   // #18
        [109.0, 190, 110.0, 195],   // #19
        [109.5, 200, 110.5, 205]    // #20
    ]
}
*/
const LOBSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Number,
            required: true,
        },
        book: {             // len:=80 array
            type: Array,    // 4(i st bid price, bid volume, ask price, ask volume) * 20 (max i)
            required: true,
        }
    }
)

const LOB = mongoose.model("LOB", LOBSchema);

export default LOB;