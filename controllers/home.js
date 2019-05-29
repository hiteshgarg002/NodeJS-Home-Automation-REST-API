const Home = require('../models/home');
const io = require('../socket');

const getCurrentDay = () => {
    const date = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    const day = weekday[date.getDay()];
    return day;
};

const getCurrentDate = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    // const dateTime = date + ' ' + time;

    return today.toLocaleDateString("en-US");
};

exports.postMotionDetectionEnabledStatus = async (req, res, next) => {
    const userId = req.body.userId;
    const status = req.body.status;

    try {

        const home = await Home.findOne({ userId: userId });

        console.log(home);

        if (!home) {
            const error = new Error("Home not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        home.motiondetection = status;
        const updatedHome = await home.save();

        res.status(201).json({ status: updatedHome.motiondetection });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMotionDetectionEnabledStatus = async (req, res, next) => {
    const userId = req.query.userId;

    try {

        const home = await Home.findOne({ userId: userId });

        console.log(home);

        if (!home) {
            const error = new Error("Home not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        res.status(201).json({ status: home.motiondetection });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const getSensorWeeklyAvg = (sensor, day) => {
    let weekDay = sensor.filter(sensor => {
        return sensor.day === day;
    });

    if (weekDay.length > 0) {
        const wd = weekDay.filter(sensor => {
            return sensor.date.toString() === new Date(Math.max.apply(null, weekDay.map(o => {
                return new Date(o.date);
            }))).toLocaleDateString().toString();
        });

        let weekDaySensor = 0;
        for (let i = 0; i < wd.length; i++) {
            weekDaySensor += wd[i].value;
        }

        weekDaySensor = weekDaySensor / wd.length;

        return weekDaySensor;
    } else {
        return 0;
    }
};

// const getLIWeekly = (sensor) => {
//     let sunday = sensor.filter(sensor => {
//         return sensor.day === "Sunday";
//     });
//     const sun = sunday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, sunday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });


//     let monday = sensor.filter(sensor => {
//         return sensor.day === "Monday";
//     });
//     const mon = monday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, monday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });

//     let tuesday = sensor.filter(sensor => {
//         return sensor.day === "Tuesday";
//     });
//     const tue = tuesday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, tuesday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });

//     let wednesday = sensor.filter(sensor => {
//         return sensor.day === "Wednesday";
//     });
//     const wed = wednesday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, wednesday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });

//     let thursday = sensor.filter(sensor => {
//         return sensor.day === "Thursday";
//     });
//     const thu = thursday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, thursday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });
//     let thuSensor = 0;
//     for (let i = 0; i < thu.length; i++) {
//         thuSensor += thu[i].value;
//     }
//     thuSensor = thuSensor / thu.length;
//     console.log(thuSensor);

//     let friday = sensor.filter(sensor => {
//         return sensor.day === "Friday";
//     });
//     const fri = friday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, friday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });

//     let saturday = sensor.filter(sensor => {
//         return sensor.day === "Saturday";
//     });
//     const sat = saturday.filter(sensor => {
//         return sensor.date.toString() === new Date(Math.max.apply(null, saturday.map(o => {
//             return new Date(o.date);
//         }))).toLocaleDateString().toString();
//     });
// };

const getWeeklyAvgSensorValues = (sensor) => {
    // console.log("Sensor :- "+sensor);
    return {
        "sun": getSensorWeeklyAvg(sensor, "Sunday"),
        "mon": getSensorWeeklyAvg(sensor, "Monday"),
        "tue": getSensorWeeklyAvg(sensor, "Tueday"),
        "wed": getSensorWeeklyAvg(sensor, "Wednesday"),
        "thu": getSensorWeeklyAvg(sensor, "Thursday"),
        "fri": getSensorWeeklyAvg(sensor, "Friday"),
        "sat": getSensorWeeklyAvg(sensor, "Saturday")
    };
};

exports.getHomeSensorValues = async (req, res, next) => {
    const hum = req.query.hum;
    const md = req.query.pir;
    const temp = req.query.temp;
    const li = req.query.ldr;

    console.log(`Humudity : ${hum}`);
    console.log(`MD : ${md}`);
    console.log(`Temp : ${temp}`);
    console.log(`LI : ${li}`);
    console.log("-------------------------");

    try {
        // const home = await Home.findOne();

        if (hum) {
            io.getIO().emit("humidity", hum);

            // home.humidity.push({
            //     value: hum,
            //     day: getCurrentDay(),
            //     date: getCurrentDate()
            // });

            // const updatedHome = await home.save();

            // io.getIO().emit("humweekly", getWeeklyAvgSensorValues(updatedHome.humidity));
            // console.log("Hum :- " + getWeeklyAvgSensorValues(updatedHome.humidity));
        }

        if (temp) {
            io.getIO().emit("temperature", temp);

            // home.temperature.push({
            //     value: temp,
            //     day: getCurrentDay(),
            //     date: getCurrentDate()
            // });

            // const updatedHome = await home.save();

            // io.getIO().emit("tempweekly", getWeeklyAvgSensorValues(updatedHome.temperature));
            // console.log("Temp :- " + getWeeklyAvgSensorValues(updatedHome.temperature));
        }

        if (li) {
            io.getIO().emit("lightintensity", li);

            // home.lightintensity.push({
            //     value: li,
            //     day: getCurrentDay(),
            //     date: getCurrentDate()
            // });

            // const updatedHome = await home.save();

            // io.getIO().emit("liweekly", getWeeklyAvgSensorValues(updatedHome.lightintensity));
            // console.log("LI :- " + getWeeklyAvgSensorValues(updatedHome.lightintensity));
        }

        if (md) {
            io.getIO().emit("motiondetection", md);
        }

        res.status(201).json({ Success: true });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

