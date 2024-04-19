var express = require('express');
var router = express.Router();
var PlantModel = require('../model/PlantModel');

router.get('/', async (req, res, next) => {
    var userId = req.cookies.userId;
    if (userId == null) {
        res.redirect('/home');
        return;
    }

    let query = PlantModel.find();
    const sort = req.query.sort;
    const { lat, lng } = req.query;

    // 检查排序参数来决定使用哪种排序
    if (sort === 'date') {
        // 按日期排序
        query = query.sort({date: -1});
    } else if (sort === 'name') {
        // 按名称排序
        query = query.sort({'identification.name': 1});
    } else if (sort === 'distance' && lat && lng) {
        // 按距离排序，前提是提供了经纬度
        query = query.near({
            center: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            spherical: true
        });
    }
    // 移除默认排序的else部分

    try {
        const data = await query.exec();
        res.render('overview', {plants: data});
    } catch (err) {
        console.error(err);
        res.status(500).send("Read Data failed");
    }
});




module.exports = router;