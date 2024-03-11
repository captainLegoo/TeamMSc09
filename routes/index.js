var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const {Double} = require("mongodb");
const uri = "mongodb+srv://lhuang50:huang123_@cluster0.ihtm3iq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
    .then((result)=> console.log('connect successfully'))
    .catch((error) => console.log(error))

const Schema = mongoose.Schema;

const plantSchema = new Schema({
  name: String,
  author: String,
  geolocation: String,
  description: String,
  outward:[{height: Number, size:Number,distribution:String}],
  features:[{hasFlower: Boolean, hasLeaf:Boolean, hasSeed:Boolean,Sun:String,FlowerColor:String}],
  tags:[{name:String,identify:String}],
  pictureUrl:String
});

const plant = mongoose.model('plant', plantSchema);
router.post('/addPlant',function (req,res){
  const newPlant = new plant({
    title: req.body.title,
    author: req.body.author,
    geolocation: req.body.geolocation,
    description: req.body.description,
    outward: [{
      height: req.body.height,
      size: req.body.size,
      distribution: req.body.distribution
    }],
    features: [{
      hasFlower: req.body.hasFlower,
      hasLeaf: req.body.hasLeaf,
      hasSeed: req.body.hasSeed,
      Sun: req.body.Sun,
      FlowerColor: req.body.FlowerColor
    }],
    tags: [{
      name: req.body.name,
      identify: req.body.tagIdentify
    }],
    pictureUrl: req.body.pictureUrl
  });
  newPlant.save()
      .then(() => {
        console.log('New plant record created successfully!');
      })
      .catch((err) => {
        console.error('Error creating plant record:', err);
      });
})

router.post('/updatePlant',async function (req, res) {
  const plantId = req.body.id;
  const existingPlant = await plant.findById(plantId);
  if (!existingPlant) {
    return res.status(404).json({message: 'Plant not found'});
  }

  existingPlant.title = updatedPlantData.title;
  existingPlant.author = updatedPlantData.author;
  existingPlant.geolocation = updatedPlantData.geolocation;
  existingPlant.description = updatedPlantData.description;
  existingPlant.outward = {
    height: updatedPlantData.height,
    size: updatedPlantData.size,
    distribution: updatedPlantData.distribution,
  };
  existingPlant.features = {
    hasFlower: updatedPlantData.hasFlower,
    hasLeaf: updatedPlantData.hasLeaf,
    hasSeed: updatedPlantData.hasSeed,
    Sun: updatedPlantData.Sun,
    FlowerColor: updatedPlantData.FlowerColor,
  };
  existingPlant.tags = {
    name: updatedPlantData.name,
    identify: updatedPlantData.tagIdentify,
  };
  existingPlant.pictureUrl = updatedPlantData.pictureUrl;

  // Save the updated plant record
  await existingPlant.save();
})

router.get('/plants', async (req, res) => {
  try {
    const allPlants = await plant.find({});
    res.status(200).json(allPlants);
  } catch (error) {
    console.error('Error fetching plant records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Randy' });
});



module.exports = router;
