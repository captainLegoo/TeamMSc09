var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');

router.get('/', (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        res.redirect('/home');
    }

    // PlantModel.find()
    //     .sort({date: -1})
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

    res.render("overview");
});

module.exports = router;