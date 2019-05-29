const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        //    required:true,
        ref: "User"
    },
    address: {
        type: String,
        required: true
    },
    arduino: [
        {
            arduinoId: {
                type: String
            },
            usedPins: [
                {
                    type: Schema.Types.Number
                }
            ]
        }
    ],
    motiondetection: {
        type: Schema.Types.Boolean
    },
    humidity: [
        {
            value: { type: Schema.Types.Number },
            day: { type: String },
            date: { type: String }
        }
    ],
    temperature: [
        {
            value: { type: Schema.Types.Number },
            day: { type: String },
            date: { type: String }
        }
    ],
    lightintensity: [
        {
            value: { type: Schema.Types.Number },
            day: { type: String },
            date: { type: String }
        }
    ]
}, { timestamps: true });

// Giving a name to collection (table) we just defined.
module.exports = mongoose.model("Home", homeSchema);
