var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const plantController = require("../controllers/plant_controller");

/**
 * @swagger
 * /mongoStatus:
 *   get:
 *     summary: Get the status of the MongoDB connection.
 *     tags: [MongoDB]
 *     responses:
 *       '200':
 *         description: The status of the MongoDB connection.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: MongoDB connection status.
 */
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

/**
 * @swagger
 * /mongo/saveOfflineData:
 *   post:
 *     summary: Save plant data offline.
 *     tags: [MongoDB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plant:
 *                 type: object
 *                 description: The plant data to be saved offline.
 *     responses:
 *       '200':
 *         description: Plant data saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rs:
 *                   type: boolean
 *                   description: Indicates if the plant data is saved successfully.
 *       '500':
 *         description: Failed to save plant data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the failure to save plant data.
 */
router.post('/saveOfflineData', async (req, res, next) => {
    const plantData = req.body.plant;
    // const { _id, ...dataToSend } = plantData;
    console.log("plantData => ", plantData);
    try {
        const saveResult = await plantController.saveOfflineData(plantData);
        if (saveResult.success) {
            return res.status(200).json({ rs: true });
        } else {
            return res.status(500).json({ rs: false });
        }
    } catch (error) {
        console.error("Error saving plant data:", error);
        return res.status(500).json({ error: 'Failed to save plant data!' });
    }
});

/**
 * @swagger
 * /mongo/saveOnlineData:
 *   get:
 *     summary: Save offline plant data to MongoDB.
 *     tags: [MongoDB]
 *     responses:
 *       '200':
 *         description: Plant data saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating the success of saving plant data.
 *       '500':
 *         description: Failed to save plant data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the failure to save plant data.
 */
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
