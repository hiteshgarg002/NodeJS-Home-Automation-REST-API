const Room = require("../models/room");
const Home = require("../models/home");
const User = require("../models/user");

exports.createRoom = async (req, res, next) => {
    const roomName = req.body.roomName;
    const userId = req.body.userId;
    try {
        const room = new Room({
            userId: userId,
            roomName: roomName
        });

        const createdRoom = await room.save();

        const user = await User.findById(userId);
        user.rooms.push(createdRoom);
        await user.save();

        // console.log("Room :- " + createdRoom);

        res.status(201).json({
            room: createdRoom
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getAllRooms = async (req, res, next) => {
    const userId = req.query.userId;

    try {
        let rooms = await Room.find({ userId: userId }).sort({ _id: -1 });

        rooms = rooms.map(room => {
            const numDevices = room.appliances.length;

            return {
                ...room._doc,
                numDevices: numDevices
            };
        });

        res.status(201).json({ rooms: rooms });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getRoom = async (req, res, next) => {
    const roomId = req.query.roomId;

    try {


        const room = await Room.findById(roomId);

        if (!room) {
            const error = new Error("Room not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        res.status(201).json({ room: room });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getAllArduinos = async (req, res, next) => {
    const userId = req.query.userId;

    try {
        let arduinos = await Home.find().select("arduino -_id").where({ userId: userId });

        if (!arduinos) {
            const error = new Error("Arduino not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        arduinos = arduinos[0].arduino.map(arduino => {
            let pins = [];

            if (arduino.usedPins.length == 0) {
                for (let i = 0; i < 10; i++) {
                    pins[i] = i;
                }
            } else {
                for (let i = 0; i < 10; i++) {
                    // array.includes(element) is used to check if element is present in array or not. Returns boolean value.
                    if (!(arduino.usedPins.includes(i))) {
                        pins[i] = i;
                    }
                }
            }

            pins = pins.filter(pin => {
                return pin != null;
            });

            return {
                unusedPins: pins,
                ...arduino
            };
        });

        const modifiedArduinos = [];

        for (let i = 0; i < arduinos.length; i++) {
            modifiedArduinos.push({
                unusedPins: arduinos[i].unusedPins,
                ...arduinos[i]._doc
            });
        }

        res.status(201).json({ arduinos: modifiedArduinos });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postAppliance = async (req, res, next) => {
    const userId = req.body.userId;
    const roomId = req.body.roomId;
    const applianceName = req.body.applianceName;
    const arduinoId = req.body.arduinoId;
    const pin = req.body.pin;
    const applianceType = req.body.applianceType;

    try {
        const room = await Room.findById(roomId);

        if (!room) {
            const error = new Error("Room not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        room.appliances.push({
            arduinoId: arduinoId,
            applianceName: applianceName,
            pin: pin,
            type: applianceType
        });

        const updatedRoom = await room.save();

        // io.getIO().sockets.in(userId).emit("reloadrooms", true);

        const home = await Home.findOne({ userId: userId });

        const arduino = home.arduino.find((ar) => {
            return ar._id.toString() === arduinoId.toString();
        });

        const index = home.arduino.findIndex((ar) => {
            return ar._id.toString() === arduinoId.toString();
        });

        arduino.usedPins.push(pin);

        home.arduino[index] = arduino;
        await home.save();

        res.status(201).json({ room: updatedRoom });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postApplianceStatus = async (req, res, next) => {
    const status = req.body.status;
    const applianceId = req.body.applianceId;
    const roomId = req.body.roomId;

    try {

        const room = await Room.findById(roomId);

        if (!room) {
            const error = new Error("Room not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        const appliance = room.appliances.find((ap) => {
            return ap._id.toString() === applianceId.toString();
        });

        appliance.status = status;
        await room.save();

        res.status(201).json({ status: status });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postDeleteAppliance = async (req, res, next) => {
    const roomId = req.params.roomId;
    const applianceId = req.params.applianceId;
    const arduinoId = req.params.arduinoId;
    const pin = req.params.pin;
    const userId = req.params.userId;

    try {

        const room = await Room.findById(roomId);

        if (!room) {
            const error = new Error("Room not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        const appliances = room.appliances.filter((appliance) => {
            return appliance._id.toString() !== applianceId.toString();
        });

        room.appliances = appliances;
        await room.save();

        // io.getIO().sockets.in(userId).emit("reloadroom", true);

        const home = await Home.findOne({ userId: userId });

        const arduino = home.arduino.find((ar) => {
            return ar._id.toString() === arduinoId.toString();
        });

        const arduinoIndex = home.arduino.findIndex((ar) => {
            return ar._id.toString() === arduinoId.toString();
        });

        const usedPins = arduino.usedPins.filter((p) => {
            return p.toString() !== pin.toString();
        });

        arduino.usedPins = usedPins;

        home.arduino[arduinoIndex] = arduino;
        await home.save();

        res.status(201).json({ deleteStatus: true });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteRoom = async (req, res, next) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;

    try {
        const room = await Room.findById(roomId);
        const home = await Home.findOne({ userId: userId });

        if (!room) {
            const error = new Error("Room not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        if (!home) {
            const error = new Error("Home not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        const pins = [];
        const arduinoIds = [];

        for (let i = 0; i < room.appliances.length; i++) {
            let pin = room.appliances[i].pin;
            let arduinoId = room.appliances[i].arduinoId.toString();

            pins.push(pin);
            arduinoIds.push(arduinoId);
        }

        for (let i = 0; i < home.arduino.length; i++) {
            for (let j = 0; j < arduinoIds.length; j++) {
                if (home.arduino[i]._id.toString() === arduinoIds[j].toString()) {
                    let pin = pins[j];
                    let index = home.arduino[i].usedPins.indexOf(pin);
                    if (index > -1) {
                        home.arduino[i].usedPins.splice(index, 1);
                    }
                }
            }
        }

        await home.save();

        await Room.findByIdAndDelete(roomId);
        res.status(201).json({ deleted: true });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getRoomsAppliancesCount = async (req, res, next) => {
    const userId = req.query.userId;

    try {
        const rooms = await Room.find().where({ userId: userId });

        if (!rooms) {
            const error = new Error("Rooms not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        const numRooms = rooms.length;
        let numAppliances = 0;

        for (let i = 0; i < rooms.length; i++) {
            numAppliances += rooms[i].appliances.length;
        }

        res.status(201).json({
            numRooms: numRooms,
            numAppliances: numAppliances
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};