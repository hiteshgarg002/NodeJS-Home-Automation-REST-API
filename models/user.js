const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    photoUrl: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: Schema.Types.Number,
        required: true,
    },
    homeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Home"
    },
    rooms: [
        {
            type: Schema.Types.ObjectId,
            ref: "Room"
        }
    ]
}, { timestamps: true });

// Giving a name to collection (table) we just defined.
module.exports = mongoose.model("User", userSchema);
