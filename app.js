const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');

const User = require("./models/user");
const testIO = require('./socket');

// Connection String
// "homeautomation" is the DB name
const MONGODB_URI = 'mongodb://localhost/homeautomation';

const app = express();

// Setting body-parser for parsing the incoming data into JSON format
app.use(bodyParser.json({ limit: "50mb" })); // application/json
app.use(bodyParser.raw({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })); // x-www-form-urlencoded <form>

// // Setting Storage and Filename for "multer"
// const fileStoragePhoto = multer.diskStorage({
//     destination: (req, file, callBack) => {
//         // null is sent as we have no errors.
//         // "images" the destination to be used as file or picture storage.
//         // make sure to create this folder manually otherwise it will cause errors.
//         console.log(file.originalname);
//         callBack(null, 'images/photo');  
//     },
//     filename: (req, file, callBack) => {
//         // null is sent as we have no errors.
//         // "images" the destination to be used as file or picture storage.
//         // "originalname" is the original name of file.
//         // Some character like ":" in image name might create problem so be aware of those.
//         callBack(null, file.originalname);
//     }
// });

// const fileStorageProfilePhoto = multer.diskStorage({
//     destination: (req, file, callBack) => {
//         // null is sent as we have no errors.
//         // "images" the destination to be used as file or picture storage.
//         // make sure to create this folder manually otherwise it will cause errors.
//         callBack(null, 'images/profilephoto');
//     },
//     filename: (req, file, callBack) => {
//         // null is sent as we have no errors.
//         // "images" the destination to be used as file or picture storage.
//         // "originalname" is the original name of file.
//         // Some character like ":" in image name might create problem so be aware of those.
//         callBack(null, file.originalname);
//     }
// });

// // Setting Filter for multer to not to accept files other than .png or .jpg 
// const fileFilter = (req, file, callBack) => {
//     if (
//         file.mimetype === "image/png" ||
//         file.mimetype === "image/jpg" ||
//         file.mimetype === "image/jpeg") {


//         // null is sent as we have no errors.
//         // true => accept the file
//         callBack(null, true);
//     } else {
//         // null is sent as we have no errors.
//         // false => reject the file.
//         callBack(null, false);
//     }
// }

// // Setting "multer", used to check every incoming that whether it contains (multipart data) i.e, file,
// // if so, then it extracts the file from it.
// // Since we expect to get only one file, we used single('field_name') method here.
// // "dest" key is the path to save the file or picture in.
// // "storage" key gives us more features than "dest"
// // "fileFilter" key is used to apply a filter so that we receive only the files type we want, like here we want .png and .jpg.
// //  app.use(multer({dest:"images"}).single('image'));
// // app.use(multer({ storage: fileStorage }).single('image'));
// app.use(multer({ storage: fileStoragePhoto, fileFilter: fileFilter }).single('photo'));
// app.use(multer({ storage: fileStorageProfilePhoto, fileFilter: fileFilter }).single('profile_photo'));

// Setting static path to images folder.
// "static" method is given by "Express", and used to set static folder.
// "/images" means every request that comes to this path(url) goes to this.
// "__dirname" gives the absolute path of this file. like we are in app.js so it gives "/"
// app.use("/images/profilephoto", express.static(path.join(__dirname, "images/profilephoto")));
app.use("/images/photo", express.static(path.join(__dirname, "images/photo")));



// Common Gotcha :- (Enabling CORS) Allowing different servers and applications to connect with our Rest-API
app.use((req, res, next) => {
    // "*" means, allowing all the domains to connect with our API.
    // We can specify any specific domain also.
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Allowing methods to be accessed by other domains.
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");

    // Allowing headers to be set by our client(domain).
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    next();
});

// SocketIO testing code
app.post('/testIO', (req, res, next) => {
    // console.log(req.body.data);
    testIO.getIO().emit('motion_detection', req.body.data);
});


// app.use((req, res, next) => {

//     User.findById("5c8b4f16dd0e420c28ad7d58")
//         .then(user => {
//             // console.log("User object :- "+user);
//             req.userId = user._id;
//             next();
//         })
//         .catch((error) => console.log(error));
// });

// Registering Routes
// appending "/auth" before every request to this route.
// every request starting from "/auth" will make it into this route.
app.use('/auth', authRoutes);
app.use('/room', roomRoutes);

// Express's error handling middleware
// Everytime either the error is thrown by 'throw' kewyord or by calling 'next(error)', 
// this middleware will be executed.
app.use((error, req, res, next) => {
    console.log(error);

    // 'statusCode' is our custom property that we have manually sat while having an error.   
    // '||' indicates that if 'statusCode' is undefined then it will take '500'
    const status = error.statusCode || 500;

    // 'message' is a in-built property which has the error message that we have passed in Error() constructor.
    const message = error.message;

    res.status(status).json({ error: message });
});

// Connecting to MongoDB and starting server at port : 8080
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then((result) => {
        const server = app.listen(8080);
        console.log('Connected!');

        // Setting socket.io for realtime communication like chatting app.
        // Works on WebSocket protocol instead of http protocol.
        // it takes the created server as an argument.
        // const io = require('socket.io')(server);
        // init() method is made by us in 'socket.js' file
        const io = require('./socket').init(server);

        // on() is the event listener, and 'connection' means we are waiting for a new connection!
        // this on() event listener will be called whenever a new connection is established.
        io.sockets.on('connection', (socket) => {
            console.log('Client Connected!');
            // io.emit("reloadroom", true);

            // // only for testing
            // socket.on("md", (data) => {
            //     console.log("Data aagya :- " + data);
            // });

            socket.on("join", (data) => {
                // console.log("User ID :- " + data);
                socket.join(data); // using socketio rooms
                io.sockets.in("5cc94c745ebd63081c3a08f9").emit("test", "Yo baby!");
                // io.sockets.in("5cc94c745ebd63081c3a08f9").emit("test", true);
            });
        });
    })
    .catch((error) => {
        console.log(error);
    });