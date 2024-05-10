var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const plantController = require("../controllers/plant_controller");

router.get('/mongoStatus', (req, res, next) => {
    const status = mongoose.connection.readyState;
    console.log("mongoStatus => ",status)
    // Connection status code description:
    // 0: disconnected
    // 1: connected
    // 2: connecting
    // 3: disconnecting
    res.json({ status });
});

router.post('/saveOfflineData', async (req, res, next) => {
    const plantData = req.body.plant;
    const { _id, ...dataToSend } = plantData;
    console.log("plantData => ", dataToSend);
    try {
        const saveResult = await plantController.saveOfflineData(dataToSend);
        if (saveResult.success) {
            return res.status(200).json({ message: saveResult.message });
        } else {
            return res.status(500).json({ error: saveResult.error });
        }
    } catch (error) {
        console.error("Error saving plant data:", error);
        return res.status(500).json({ error: 'Failed to save plant data!' });
    }
});

router.get('/saveOnlineData', async (req, res, next) => {
    try {
        const result = await plantController.getAllNotInIndexedDB()
        if (result.success) {
            return res.status(200).json({ message: result.data });
        } else {
            return res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error("Error saving plant data:", error);
        return res.status(500).json({ error: 'Failed to save plant data!' });
    }
});

module.exports = router;
