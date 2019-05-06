const multer = require('multer');
const path = require('path');
const User = require("../models/user");

// Setting Storage and Filename for "multer"
const fileStoragePhoto = multer.diskStorage({
    destination: (req, file, callBack) => {
        // null is sent as we have no errors.
        // "images" the destination to be used as file or picture storage.
        // make sure to create this folder manually otherwise it will cause errors.
        // console.log(file.originalname);
        // callBack(null, 'images/photo');
        callBack(null, path.join(__dirname, "../", "images/photo"));
    },
    filename: (req, file, callBack) => {
        // null is sent as we have no errors.
        // "images" the destination to be used as file or picture storage.
        // "originalname" is the original name of file.
        // Some character like ":" in image name might create problem so be aware of those.
        callBack(null, file.originalname);
    }
});

// Setting Filter for multer to not to accept files other than .png or .jpg 
const fileFilter = (req, file, callBack) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {

        // null is sent as we have no errors.
        // true => accept the file
        callBack(null, true);
    } else {
        // null is sent as we have no errors.
        // false => reject the file.
        callBack(null, false);
    }
}

// Setting "multer", used to check every incoming that whether it contains (multipart data) i.e, file,
// if so, then it extracts the file from it.
// Since we expect to get only one file, we used single('field_name') method here.
// "dest" key is the path to save the file or picture in.
// "storage" key gives us more features than "dest"
// "fileFilter" key is used to apply a filter so that we receive only the files type we want, like here we want .png and .jpg.
//  app.use(multer({dest:"images"}).single('image'));
// app.use(multer({ storage: fileStorage }).single('image'));
exports.uploadPhoto = async (req, res, next) => {
    // console.log("caption bhi aagye re :- " + req.body.caption);
    var uploadPost = multer({
        storage: fileStoragePhoto,
        fileFilter: fileFilter
    }).single('photo');

    uploadPost(req, res, async (error) => {
        if (error) {
            return res.end("error uploading file");
        }

        let photoUrl = req.file.path + "";
        const indexOfImages = photoUrl.indexOf("images");
        photoUrl = photoUrl.substring(indexOfImages).replace(/\\/g, '/');

        res.status(201).json({
            photoUrl: photoUrl
        });
    });
};