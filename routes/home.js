var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');
const IdGenerator = require('../utils/IdGenerator');
const generator = new IdGenerator(1, 1);
const connectToDatabase = require('../db/db');

function onDatabaseConnect() {
    console.log("Successfully connected to the database");
}
function onDatabaseError() {
    console.error("Failed to connect to the database");
}
//connectToDatabase(onDatabaseConnect, onDatabaseError);


router.get('/', async (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        userId = generator.getId();
        res.cookie("userId", userId, {maxAge: 365 * 24 * 60 * 60 * 1000});
    }
    console.log("userId: " + userId);

    try {
        const data = await PlantModel.find()
            .sort({date: -1})
            .limit(3);

        // console.log(data);
        // Response successful
        res.render('home', {plants: data});
    } catch (err) {
        console.error(err);
        res.status(500).send("Read Data failed");
    }
});

module.exports = router;