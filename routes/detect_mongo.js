var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

router.get('/mongoStatus', (req, res, next) => {
    const status = mongoose.connection.readyState;
    console.log("mongoStatus => ",status)
    // Connection status code description:
    // 0: disconnected
    // 1: connected
    // 2: connecting
    // 3: disconnecting
    res.json({ status });
});

module.exports = router;
