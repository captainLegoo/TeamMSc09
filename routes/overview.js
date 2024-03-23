var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');

router.get('/', async (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        res.redirect('/home');
    }

    try {
        const data = await PlantModel.find().sort({date: -1});
        // Response successful
        res.render('overview', {plants: data});
    } catch (err) {
        console.error(err);
        res.status(500).send("Read Data failed");
    }
});

module.exports = router;