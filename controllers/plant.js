// Import the plant model
const plantModel = require('../model/PlantModel');

// Function to create new plants
exports.create = function (plantData) {
    console.log(plantData)
    let plant = new plantModel({
        text: plantData.text,
    });
    return plant.save().then(plant => {
        console.log(plant);

        return JSON.stringify(plant);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to get all plants
exports.getAll = function (sort, lat, lng) {

    let sortQuery = {date: -1}; // Default sorting by date

    if (sort === 'date' || sort === 'default' || sort === null) {
        sortQuery = ({date: -1});
    } else if (sort === 'name') {
        sortQuery = ({'identification.name': 1});
    } else if (sort === 'distance' && lat && lng) {
        
    }

    // Retrieve all plants from the database
    return plantModel.find({}).sort(sortQuery).then(plants => {
        // Return the list of plants as a JSON string
        return plants;
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
}
;

