var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    const code = req.query.code;
    if (code === "1") {
        res.render('success', { title: 'Successfully Added'});
    } else {
        res.render('success',{title:'Failed To Add'});
    }
});

module.exports = router;