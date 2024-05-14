// Import the plant model
const plantModel = require('../model/PlantModel');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

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
    // console.log("sort => ", sort)
    if (sort === 'distance' && lat && lng) {
        return plantModel.find({}).then(plants => {
            return plants.sort((a, b) => {
                const distanceA = calculateDistance(lat, lng, a.location.coordinates[1], a.location.coordinates[0]);
                const distanceB = calculateDistance(lat, lng, b.location.coordinates[1], b.location.coordinates[0]);
                return distanceA - distanceB;
            });
        });
    }


    let sortQuery = {date: -1}; // Default sorting by date
    let filter = null;

    if (sort === 'date' || sort === 'default' || sort === null) {
        sortQuery = ({date: -1});
    } else if (sort === 'name') {
        sortQuery = ({'identification.name': 1});
    } else if (sort === 'withFlowers') {
        filter = {haveFlower: true};
    } else if (sort === 'withoutFlowers') {
        filter = {haveFlower: false};
    }

    // Retrieve all plants from the database
    return plantModel.find(filter).sort(sortQuery).then(plants => {
        // Return the list of plants as a JSON string
        return plants;
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

exports.getSinglePlant = function (plantId) {
    return plantModel.find({plantId: plantId});
}

exports.saveOfflineData = async function (plant) {
    try {
        // 创建新的植物数据并保存到数据库
        const newPlant = new plantModel(plant);
        await newPlant.save();
        return { success: true, message: 'Plant data saved successfully!' };
    } catch (error) {
        console.error("Error saving plant data:", error);
        return { success: false, error: 'Failed to save plant data!' };
    }
};

exports.getAllNotInIndexedDB = async function () {
    try {
        const plants = await plantModel.find({ isInIndexedDB: false });
        return { success: true, data: plants };
    } catch (error) {
        console.error("Error saving plant data:", error);
        return { success: false, error: 'Failed to save plant data!' };
    }
};

exports.getPlantsByUserId = async (userId) => {
    try {
        return await plantModel.find({userId});
    } catch (error) {
        console.error("Error getting plants by userId:", error);
        return { success: false, error: error.message };
    }
};