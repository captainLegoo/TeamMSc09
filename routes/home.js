var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');
const IdGenerator = require('../utils/IdGenerator');
const generator = new IdGenerator(1, 1);
const connectToDatabase = require('../db/db');

// 定义成功连接的回调函数
function onDatabaseConnect() {
    console.log("Successfully connected to the database");
    // 在这里可以继续编写你的逻辑
}

// 定义连接失败的回调函数
function onDatabaseError() {
    console.error("Failed to connect to the database");
}
// 调用数据库连接函数，并传递成功和失败的回调函数
connectToDatabase(onDatabaseConnect, onDatabaseError);


router.get('/', (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        userId = generator.getId();
        res.cookie("userId", userId, {maxAge: 365 * 24 * 60 * 60 * 1000});
    }
    console.log("userId: " + userId);

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