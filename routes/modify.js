var express = require('express');
var router = express.Router();

const url = require('url');
const PlantModel = require('../model/PlantModel');
const {Double} = require("mongodb");
const URI = "mongodb+srv://lhuang50:huang123_@cluster0.ihtm3iq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoose = require('mongoose');

const fs = require('fs');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
// mongoose.connect(URI)
//     .then((result)=> console.log('connect successfully'))
//     .catch((error) => console.log(error))

// ADD PLANT
router.post('/addPlant',upload.single('photo'),function (req,res){
  let base64Image = '';
  fs.readFile(req.file.path, (err, data) => {
    base64Image = data.toString('base64');
  });

  const plant = new PlantModel({
    date: new Date(),
    location: {
      coordinates: [req.body.latitude, req.body.longitude]
    },
    description : req.body.description,
    plantSize : req.body.plantSize,
    haveFlower : (req.body.haveFlower === 'true'),
    haveLeaves : (req.body.haveLeaves === 'true'),
    haveSeeds : (req.body.haveSeeds === 'true'),
    sunExposure : req.body.sunExposure,
    flowerColor : req.body.flowerColor,
    identification : {
      name : req.body.id_name,
      status : req.body.id_status,
      suggestedNames : req.body.id_suggestedNames,
      dbpediaInfo : {
        commonName : req.body.id_info_commonName,
        scientificName : req.body.id_info_scientificName,
        description : req.body.id_info_description,
        uri : req.body.id_info_uri,
      }
    },
    photo : base64Image,
    userNickname : req.body.userNickname
  });

  plant.save()
    .then(() => {
      console.log('New plant record created successfully!');
      res.render('index',{title:'successfully added'})
    })
    .catch((err) => {
      console.error('Error creating plant record:', err);
      res.render('index',{title:'failed to add'});
    });

})

// UPDATE PLANT
router.post('/updatePlant', async (req, res)=>{
  const _id = req.body._id;
  const plant = await PlantModel.findById(_id);
  if (!plant) {
    return res.status(404).json({message: 'Plant not found'});
  }
  plant.location.coordinates = [req.body.latitude, req.body.longitude];
  plant.description = req.body.description;
  plant.plantSize = req.body.plantSize;
  plant.haveFlower = (req.body.haveFlower==='true');
  plant.haveLeaves = (req.body.haveLeaves==='true');
  plant.haveSeeds = (req.body.haveSeeds==='true');
  plant.sunExposure = req.body.sunExposure;
  plant.flowerColor = req.body.flowerColor;
  plant.identification.name = req.body.id_name;
  plant.identification.status = req.body.id_status;
  plant.identification.suggestedNames = req.body.id_suggestedNames;
  plant.identification.dbpediaInfo.commonName = req.body.id_info_commonName;
  plant.identification.dbpediaInfo.scientificName = req.body.id_info_scientificName;
  plant.identification.dbpediaInfo.description = req.body.id_info_description;
  plant.identification.dbpediaInfo.uri = req.body.id_info_uri;
  plant.photo = req.body.photo;
  plant.userNickname = req.body.userNickname;

  await plant.save();
  res.redirect('/');
})

router.get('/plants', async (req, res) => {
  try {
    const allPlants = await PlantModel.find({});
    res.send(allPlants);
    //res.status(200).json(allPlants);
  } catch (error) {
    console.error('Error fetching plant records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// /* GET home page. */
router.get('/', async (req, res) => {
  try {
    const allPlants = await PlantModel.findById('65ef932e7f392acbffefa873');
    res.render('singlePlant',{data:allPlants,title:'randy'});
  } catch (error) {
    console.error('Error fetching plant records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/edit',async (req,res) => {
  const _id = req.params._id;
  const urlObj = url.parse(req.url, true);
  const query = urlObj.query;
  const id = query._id;
  console.log(query._id);
  try {
    const plant = await PlantModel.findById('65ef932e7f392acbffefa873');
    if (!plant) {
      return res.status(404).json({message: 'Plant not found'});
    }
    res.render('editPlant',{title:'aaa',data:plant});
  } catch (error) {
    console.error('Error fetching plant records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.post('/add-comment', async (req,res) => {
  const _id = req.body._id;
  const _comment = req.body.comment;

  const plant = await PlantModel.findById(_id);
  plant.comment.push({msg:_comment});
  await plant.save();
  const allPlants = await PlantModel.findById(_id);

  res.render('singlePlant',{data:allPlants,title:'randy'});
})



module.exports = router;
