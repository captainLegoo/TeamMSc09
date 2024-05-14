var express = require('express');
var router = express.Router();
var plantController = require("../controllers/plant_controller");

/**
 * @swagger
 * /overview:
 *   get:
 *     summary: Get plants page
 *     tags: [Overview]
 *     requestBody:
 *       required: false
 *     response:
 *       200:
 *         description: show overview page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: <html>...</html>
 */
router.get('/', function (req, res, next) {
    res.render('overview');
});

/**
 * @swagger
 * /overview/all:
 *  get:
 *      summary: Get all plants.
 *      tags: [Overview]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          sort:
 *                              type: string
 *                              enum: [name, distance, date, withFlowers, withoutFlowers]
 *                              description: The sort type.
 *                              required: true
 *                          lat:
 *                              type: number
 *                              description: The latitude of the user.
 *                              required: false
 *                          lng:
 *                              type: number
 *                              description: The longitude of the user.
 *                              required: false
 *                          userId:
 *                              type: string
 *                              description: The user id.
 *                              required: false
 *                              example: 1234567890
 *      response:
 *          200:
 *              description: The list of plants.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 */
router.get('/all', async (req, res, next) => {

    const {sort, lat, lng, userId} = req.query;
    console.log('sort = ' + sort)
    console.log('userId = ' + userId)
    console.log('lat = ' + lat + ' lng = ' + lng)

    try {
        let plants = null;
        if (sort === "only") {
            plants = await plantController.getPlantsByUserId(userId);
        } else {
            plants = await plantController.getAll(sort, lat, lng);
        }
        // res.render('overview', {plants: plants});
        res.json(plants);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;