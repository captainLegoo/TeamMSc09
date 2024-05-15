var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /:
 *  get:
 *    summary: Render success page based on the provided code.
 *    tags: [Success]
 *    parameters:
 *      - in: query
 *        name: code
 *        required: true
 *        description: Code to determine the success status.
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: Rendered success page.
 *        content:
 *          text/html:
 *            schema:
 *              type: string
 */
router.get('/', function (req, res, next) {
    const code = req.query.code;
    if (code === "1") {
        res.render('success', { title: 'Successfully Added'});
    } else {
        res.render('success',{title:'Failed To Add'});
    }
});

module.exports = router;