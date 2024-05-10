var express = require('express');
var router = express.Router();
const IdGenerator = require('../utils/IdGenerator');
const generator = new IdGenerator(1, 1);

router.get('/', function (req, res, next) {
    var userId = req.cookies.userId;
    if (userId == null) {
        res.render('overview');
    }
    const code = req.query.code;
    if (code === "1") {
        res.render('success', { title: 'Successfully Added'});
    } else {
        res.render('success',{title:'Failed To Add'});
    }
});

module.exports = router;