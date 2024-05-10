// const mongoose = require('mongoose');
//
// const {DBHOST, DBPORT, DBNAME} = require("../config/config");
// const mongoDB = `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`;
// let connection;
//
// // Set Mongoose to use the global Promise library
// mongoose.Promise = global.Promise;
//
// // Connect to the MongoDB server
// mongoose.connect(mongoDB).then(result => {
//     // Store the connection instance for later use if needed
//     connection = result.connection;
//     // Log a success message if the connection is established
//     console.log("Connection Successful!");
// }).catch(err => {
//     // Log an error message if the connection fails
//     console.log("Connection Failed!", err);
// });

const mongoose = require('mongoose');
const retry = require('retry');

const { DBHOST, DBPORT, DBNAME } = require("../config/config");
const mongoDB = `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`;
let connection;

// Set Mongoose to use the global Promise library
mongoose.Promise = global.Promise;

function connectWithRetry() {
    const operation = retry.operation({
        retries: 10,  // 重连的次数
        factor: 2,    // 重连时间间隔的增长因子
        minTimeout: 1000, // 最小的重连时间间隔
        maxTimeout: 60000 // 最大的重连时间间隔
    });

    operation.attempt(() => {
        // Connect to the MongoDB server
        mongoose.connect(mongoDB).then(result => {
            // Store the connection instance for later use if needed
            connection = result.connection;
            // Log a success message if the connection is established
            console.log("Connection Successful!");
        }).catch(err => {
            // Log an error message if the connection fails
            console.log("Connection Failed!", err);
            if (operation.retry(err)) {
                return;
            }
            console.error("Max retries reached, unable to connect to MongoDB");
        });
    });
}

connectWithRetry();