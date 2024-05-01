var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');
const maxDistance = 10000; // 10 km

router.get('/', async (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        res.redirect('/home');
        return;
    }

    let query = PlantModel.find();
    const {sort} = req.query;
    const {lat, lng} = req.query;
    console.log('sort = ' + sort)
    console.log('lat = ' + lat + ' lng = ' + lng)

    if (sort === 'date' || sort === 'default' || sort === null) {
        query = query.sort({date: -1});
    } else if (sort === 'name') {
        query = query.sort({'identification.name': 1});
    } else if (sort === 'distance' && lat && lng) {
        console.log('lat = ' + lat + ' lng = ' + lng)

    }

    try {
        const data = await query.exec();
        res.render('overview', {plants: data});
    } catch (err) {
        console.error(err);
        res.status(500).send("Read Data failed");
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