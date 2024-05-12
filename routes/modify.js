var express = require('express');
var router = express.Router();

const PlantModel = require('../model/PlantModel');
const {Double} = require("mongodb");
var plantController = require("../controllers/plant_controller");

const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

router.get('/',function (req, res){
  res.render('singlePlant')
})
router.get('/editPlant',function (req, res){
  res.render('editPlant')
})
router.get('/addPlant',function (req,res){
  res.render('addPlant')
})

router.get('/singlePlantData', async (req, res) => {
  const querySegment = req.url.split('?')[1];
  const plantId = querySegment.split('=')[1];
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0];

  const endpointUrl = 'https://dbpedia.org/sparql';
  const sparqlQuery = `
   SELECT ?plant ?abstract WHERE {
   ?plant rdfs:label "${plant.identification.name}"@en;
         a dbo:Plant;
         dbo:abstract ?abstract.
  FILTER (lang(?abstract) = 'en')
  } LIMIT 1`;
  // Encode the query as a URL parameter
  const encodedQuery = encodeURIComponent(sparqlQuery);
  // Build the URL for the SPARQL query
  const url = `${endpointUrl}?query=${encodedQuery}&format=json`;
  // Use fetch to retrieve the data
  fetch(url)
      .then(response => response.json())
      .then(data => {
        // The results are in the 'data' object
        let bindings = data.results.bindings;
        plant.identification.dbpediaInfo.uri = bindings[0].plant.value;
        plant.identification.dbpediaInfo.description = bindings[0].abstract.value;
        res.json(plant)
      }).
  catch( error => {
    plant.identification.dbpediaInfo.uri = '';
    plant.identification.dbpediaInfo.description = '';
    console.log('Failed to fetch uri')
    res.json(plant)
  });

});

router.post('/addPlant',upload.single('photo'),function (req,res){
    const base64Image = 'data:image/png;base64,'+req.file.buffer.toString('base64');
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
        name : req.body.name,
        status : req.body.id_status,
        suggestedNames : req.body.id_suggestedNames,
        // dbpediaInfo : {
        //   commonName : req.body.id_info_commonName,
        //   scientificName : req.body.id_info_scientificName,
        //   description : req.body.id_info_description,
        //   uri : req.body.id_info_uri,
        // }
      },
      photo : base64Image,
      userNickname : req.cookies.userNickname,
      userId : req.cookies.userId,
      isInMongoDB: true,
      isInIndexedDB: true,
      plantId: (new Date().getTime() * 1000 + Math.floor(Math.random() * 1000)).toString()
    });

    plant.save()
        .then(() => {
          console.log('new plant add successfully!');
          res.json({})
        })
        .catch((err) => {
          console.error('failed to add new plant', err);
          res.json({})
        });
})

router.post('/updatePlant', async (req, res)=>{

  plantId = req.body.plantId;
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0]

  plant.location.coordinates = [req.body.latitude, req.body.longitude];
  plant.description = req.body.description;
  plant.plantSize = req.body.plantSize;
  plant.haveFlower = (req.body.haveFlower==='true');
  plant.haveLeaves = (req.body.haveLeaves==='true');
  plant.haveSeeds = (req.body.haveSeeds==='true');
  plant.sunExposure = req.body.sunExposure;
  plant.flowerColor = req.body.flowerColor;
  plant.identification.name = req.body.name;
  plant.identification.status = req.body.id_status;
  plant.identification.suggestedNames = req.body.id_suggestedNames;
  //plant.identification.dbpediaInfo.commonName = req.body.id_info_commonName;
  //plant.identification.dbpediaInfo.scientificName = req.body.id_info_scientificName;
  //plant.identification.dbpediaInfo.description = req.body.id_info_description;
  //plant.identification.dbpediaInfo.uri = req.body.id_info_uri;

  plant.userNickname = req.body.userNickname;
  plant.save()
    .then(() => {
      console.log('update successfully!');
      // res.json({})
      res.redirect('editPlant?plantId='+plantId)
    })
    .catch((err) => {
      console.error('failed to update plant', err);
      // res.json({})
      res.redirect('editPlant?plantId='+plantId)
    });
})

router.post('/add-comment', async (req,res) => {
  const plantId = req.body._id;
  const comment = req.body.comment;
  const name = req.body.name;
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0]
  plant.comment.push({msg:comment,name:name});
  await plant.save();
  res.json({})
})

module.exports = router;
