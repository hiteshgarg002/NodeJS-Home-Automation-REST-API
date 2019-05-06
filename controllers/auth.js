const User = require("../models/user");
const Home = require("../models/home");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

// Setting 'tansporter' to use 'nodemailer' with 'SendGrid' mailing server API
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

exports.createHomeUser = async (req, res, next) => {
    const address = req.body.address;
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const name = req.body.name;
    const photoUrl = req.body.photoUrl;

    try {
        const home = new Home({
            address: address
        });

        const createdHome = await home.save();

        // encrypting password
        // 12 (it is maximum) is the number of hash rounds to be performed on password.
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            name: name,
            password: hashedPassword,
            phone: phone,
            photoUrl: photoUrl,
            homeId: createdHome
        });

        const createdUser = await user.save();

        createdHome.userId = createdUser._id;
        await createdHome.save();

        transporter.sendMail({
            to: email,
            from: 'hitesh@home-automation.com',
            subject: 'Registration Confirmed!',
            // 'html' is the containt of mail i.e, body of mail
            // `` allows us to write in multi lines
            html: `<h3>Congratulations for making your home automated.</h3>
                    <h4>Here are your credentials.</h4>
                    <p>Email :- ${email}</p>
                    <p>Password :- ${password}</p>
                    <p>Phone :- ${phone}</p></br>
                    <p><b>Note</b> :- You may change your password from the app at anytime.<p>`
        });

        res.status(201).json({
            home: createdHome,
            // user: createdUser
        });

    } catch (err) {
        if (!err.statusCode) {
            // "statusCode" is our own custom property and we can name it anything we want.
            err.statusCode = 500;
        }
        // Since we are in async code snippet, 
        // throwing an error won't reach to error handling 'express-middleware' that we have defined in app.js.
        // So we have to pass it in next(error) function.
        next(err);
    }
};

// exports.postSignup = async (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const phone = req.body.phone;
//     const name = req.body.name;
//     const photoUrl = req.body.photoUrl;

//     try {
//         // encrypting password
//         // 12 (it is maximum) is the number of hash rounds to be performed on password.
//         const hashedPassword = await bcrypt.hash(password, 12);

//         const user = new User({
//             email: email,
//             name: name,
//             password: hashedPassword,
//             phone: phone,
//             photoUrl: photoUrl
//         });

//         const createdUser = await user.save();

//         res.status(201).json({
//             user: {
//                 email: createdUser.email,
//                 password: password
//             }
//         });

//     } catch (err) {
//         if (!err.statusCode) {
//             // "statusCode" is our own custom property and we can name it anything we want.
//             err.statusCode = 500;
//         }
//         // Since we are in async code snippet, 
//         // throwing an error won't reach to error handling 'express-middleware' that we have defined in app.js.
//         // So we have to pass it in next(error) function.
//         next(err);
//     }
// };

exports.postLogin = async (req, res, next) => {
    const userEmail = req.body.email;
    const password = req.body.password;

    // console.log(userEmail);
    // console.log(password);

    const user = await User.findOne({ email: userEmail });
    // console.log("User : " + user);

    // console.log("User Password : " + user.password);

    if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 401;

        // 'throw' will throw an error and exit this function here.
        // this will then go to Express's 'error-handling' middleware which we have defined in app.js
        throw error;
    }
    try {
        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error("Invalid Password!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        user.password = password;
        res.status(201).json({ user: user });
    } catch (err) {
        if (!err.statusCode) {
            // "statusCode" is our own custom property and we can name it anything we want.
            err.statusCode = 500;
        }
        // Since we are in async code snippet, 
        // throwing an error won't reach to error handling 'express-middleware' that we have defined in app.js.
        // So we have to pass it in next(error) function.
        next(err);
    }
};

exports.postArduino = async (req, res, next) => {
    const homeId = req.body.homeId;
    const arduinoId = req.body.arduinoId;

    try {
        const home = await Home.findById(homeId);
        if (!home) {
            const error = new Error("Home not found!");
            error.statusCode = 401;

            // 'throw' will throw an error and exit this function here.
            // this will then go to Express's 'error-handling' middleware which we have defined in app.js
            throw error;
        }

        home.arduino.push({
            arduinoId: arduinoId.toString().trim()
        });

        const updatedHome = await home.save();
        res.status(201).json({ home: updatedHome });
    } catch (err) {
        if (!err.statusCode) {
            // "statusCode" is our own custom property and we can name it anything we want.
            err.statusCode = 500;
        }
        // Since we are in async code snippet, 
        // throwing an error won't reach to error handling 'express-middleware' that we have defined in app.js.
        // So we have to pass it in next(error) function.
        next(err);
    }
};