// module.exports = function (success, error) {
//     // Determine error and set default value
//     if (typeof error !== "function") {
//         error = () => {
//             console.log("Connection failed");
//         }
//     }
//
//     // import mongoose
//     const mongoose = require("mongoose");
//     // Import configuration file
//
//
//     mongoose.set('strictQuery', false);
//
//     mongoose.Promise = global.Promise
//
//     // connect mongodb
//     mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);
//
//     mongoose.connection.once("open", () => {
//         success();
//     });
//
//     mongoose.connection.on("error", () => {
//         error();
//         // Set callback for connection errors
//         console.log("Connection failed");
//     });
//     mongoose.connection.on("close", () => {
//         // Set callback for connection close
//         console.log("connection closed");
//     });
// }

const mongoose = require('mongoose');

const {DBHOST, DBPORT, DBNAME} = require("../config/config");
const mongoDB = `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`;
let connection;

// Set Mongoose to use the global Promise library
mongoose.Promise = global.Promise;

// Connect to the MongoDB server
mongoose.connect(mongoDB).then(result => {
    // Store the connection instance for later use if needed
    connection = result.connection;
    // Log a success message if the connection is established
    console.log("Connection Successful!");
}).catch(err => {
    // Log an error message if the connection fails
    console.log("Connection Failed!", err);
});