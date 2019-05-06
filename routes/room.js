const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room');

router.post('/postRoom', roomController.createRoom);

router.get('/getAllRooms', roomController.getAllRooms);

router.get('/getRoom', roomController.getRoom);

router.get('/getAllArduinos', roomController.getAllArduinos);

router.post('/postAppliance', roomController.postAppliance);

router.post('/postApplianceStatus', roomController.postApplianceStatus);

router.delete('/postDeleteAppliance/:userId/:roomId/:applianceId/:arduinoId/:pin', roomController.postDeleteAppliance);

router.delete('/postDeleteRoom/:userId/:roomId', roomController.deleteRoom);

module.exports = router;