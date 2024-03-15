var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', async function (req, res, next) {
//     // Get the ID from the request parameters
//     const plantId = req.params.id;
//     // Fetch the plant data from your data source using the plantId
//     // This is just an example. You would replace this with your actual data fetching logic.
//     const plantData = await getPlantDataById(plantId);
//     const comments = await getCommentsByPlantId(plantId); // This should return an array of comment objects.
//     res.render('singlePlant', {plant: plantData, comments: comments});
// });

// Dummy function that mimics fetching data from a database
// Replace this with your actual data-fetching logic
async function getPlantDataById(plantId) {
    // In a real app, this would be a database query. Here's a dummy object:
    return {
        id: plantId,
        name: 'Bellis perennis',
        description: 'Daisies are known for their iconic white petals and yellow centers.',
        photoUrl: '/images/daisy.jpg',
        hasFlower: true,
        hasLeaf: true,
        hasGain: false,
        sun: true,
        color: 'yellow',
        position: 'China',
        url:'https://en.wikipedia.org/wiki/Bellis_perennis',
        // ... other properties
    };
}
async function getCommentsByPlantId(plantId) {
    // Replace this with your actual query to the database.
    // The query would typically look for comments where the plant_id matches the plantId parameter.
    // For example:
    // SELECT * FROM comments WHERE plant_id = $1
    return [
        {
            author: 'User1',
            content: 'Love this plant!',
            // ... other comment properties
        },
        // ... more comments
    ];
}


module.exports = router;
