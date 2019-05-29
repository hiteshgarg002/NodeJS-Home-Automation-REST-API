const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');

router.put('/postMotionDetectionEnabledStatus', homeController.postMotionDetectionEnabledStatus);

router.get('/getMotionDetectionEnabledStatus', homeController.getMotionDetectionEnabledStatus);

router.get('/getHomeSensorValues', homeController.getHomeSensorValues);

module.exports = router;