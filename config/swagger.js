const path = require('path')
const express = require('express')
const swaggerUI = require('swagger-ui-express')
const swaggerDoc = require('swagger-jsdoc')
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Plant API',
            version: '1.0.0',
            description: 'A basic application to discover and share plant sightings',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./routes/*.js'],
}
var swaggerJson = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
}
const swaggerSpec = swaggerDoc(options)

var swaggerInstall = function(app) {
    if (!app){
        app = express()
    }
    app.get('/swagger.json', swaggerJson);
    app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
}
module.exports = swaggerInstall
