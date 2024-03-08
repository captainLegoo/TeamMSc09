/**
 * @param {*} success Callback for successful database connection
 * @param {*} error Database connection failure callback
 */
module.exports = function (success, error) {
    // Determine error and set default value
    if (typeof error !== "function") {
        error = () => {
            console.log("Connection failed");
        }
    }

    // import mongoose
    const mongoose = require("mongoose");
    // Import configuration file
    const {DBHOST, DBPORT, DBNAME} = require("../config/config");

    mongoose.set('strictQuery', false);

    // connect mongodb
    mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);

    mongoose.connection.once("open", () => {
        success();
    });

    mongoose.connection.on("error", () => {
        error();
        // Set callback for connection errors
        console.log("Connection failed");
    });
    mongoose.connection.on("close", () => {
        // Set callback for connection close
        console.log("connection closed");
    });
}

