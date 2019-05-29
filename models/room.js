const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    roomName: {
        type: String,
        required: true
    },
    appliances: [
        {

            // // every arduino will have unique id (id will be given in arduido itself)
            // // every arduino has 10 pins for the devices
            // // every device needs only 1 pin in order to be connected, some needs more than one like "distance sensor"
            // arduinoId: {
            //     type: String,
            //     required: true
            // },
            arduinoId: {
                type: Schema.Types.ObjectId,
                required: true,
            },
            pin: {
                type: Schema.Types.Number,
                required: true
            },
            // appliance name
            applianceName: {
                type: String,
                required: true
            },
            // if appliance is type of "Status" then it will have either true or false
            // This is only for "Appliances" like bulb
            status: {
                type: Boolean,
                def: false,
            },

            // if appliance is type of "Reading" then it will have values (might be in %) 
            // This is only for "Sensors" like temperature sensor
            reading: {
                type: String,
                def: "0",
            },
            // type is the property that defines whether it is a Applianc or Sensor.
            // types - "Status" and "Reading"
            type: {
                type: String,
                required: true
            },
            timestamp: {
                type: Schema.Types.Date,
                required: true
            },
            day: {
                type: String,
                required: true
            }
        }
    ],
    automode: {
        type: Schema.Types.Boolean
    },
    bulb1: {
        type: Schema.Types.Boolean
    },
    bulb2: {
        type: Schema.Types.Boolean
    },
    bulb3: {
        type: Schema.Types.Boolean
    },
    bulb4: {
        type: Schema.Types.Boolean
    },
    bulb5: {
        type: Schema.Types.Boolean
    },
    bulb6: {
        type: Schema.Types.Boolean
    }
}, { timestamps: true });

// Giving a name to collection (table) we just defined.
module.exports = mongoose.model("Room", roomSchema);
