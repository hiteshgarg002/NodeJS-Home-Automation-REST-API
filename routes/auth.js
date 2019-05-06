const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const uploadFileController = require('../controllers/file_upload');

// router.post('/postSignup', authController.postSignup);
router.post('/postHomeUser', authController.createHomeUser);

router.post('/postLogin', authController.postLogin);

router.post('/uploadPhoto', uploadFileController.uploadPhoto);

router.post('/postArduino', authController.postArduino);

module.exports = router;