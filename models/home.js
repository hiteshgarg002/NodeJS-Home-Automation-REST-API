const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        //    required:true,
        ref: "User"
    },
    arduino: [
        {
            arduinoId: {
                type: String,
            },
            usedPins: [
                {
                    type: Schema.Types.Number
                }
            ]
        }
    ],
    address: {
        type: String,
        required: true
    }
});

// Giving a name to collection (table) we just defined.
module.exports = mongoose.model("Home", homeSchema);
