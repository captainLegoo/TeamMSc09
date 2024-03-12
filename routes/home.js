var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');
const IdGenerator = require('../utils/IdGenerator');
const generator = new IdGenerator(1, 1);

router.get('/', (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        userId = generator.getId();
        res.cookie("userId", userId, {maxAge: 365 * 24 * 60 * 60 * 1000});
    }
    // console.log("userId: " + userId);

    // PlantModel.find()
    //     .sort({date: -1})
    //     .limit(3)
    //     .then((data) => {
    //         console.log(data);
    //         // Response successful
    //         // res.render('home', { })
    //     }).catch(err => {
    //     if (err) {
    //         res.status(500).send("Read Data failed");
    //         return;
    //     }
    // });

    res.send("/home");
});

module.exports = router;