var express = require('express');
var router = express.Router();
const IdGenerator = require('../utils/IdGenerator');
const generator = new IdGenerator(1, 1);
var plantController = require("../controllers/plant_controller");

router.get('/', function (req, res, next) {
    var userId = req.cookies.userId;
    if (userId == null) {
        userId = generator.getId();
        res.cookie("userId", userId, {maxAge: 365 * 24 * 60 * 60 * 1000});
    }
    console.log("userId: " + userId);
    res.render('overview');
});

router.get('/all', async (req, res, next) => {

    const {sort, lat, lng} = req.query;
    console.log('sort = ' + sort)
    console.log('lat = ' + lat + ' lng = ' + lng)

    try {
        let plants = null;
        if (sort === "only") {
            plants = await plantController.getPlantsByUserId(req.cookies.userId);
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

function calculateDistance(coord1, coord2) {
    const R = 6371e3;
    const phi1 = coord1[1] * Math.PI / 180;
    const phi2 = coord2[1] * Math.PI / 180;
    const deltaPhi = (coord2[1] - coord1[1]) * Math.PI / 180;
    const deltaLambda = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // meter

    return distance;
}

module.exports = router;