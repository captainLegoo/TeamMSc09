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
  const plantId = req.query.plantId;
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0];
  const queryPlantName = retrievePlantName(plant.identification.name)

  const endpointUrl = 'https://dbpedia.org/sparql';
  const sparqlQuery = `
   SELECT ?plant ?abstract WHERE {
   ?plant rdfs:label "${queryPlantName}"@en;
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
        plant.identification.dbpediaInfo.uri = (bindings[0].plant.value !== undefined && bindings[0].plant.value !== '') ? bindings[0].plant.value : ''
        plant.identification.dbpediaInfo.description = (bindings[0].abstract.value !== undefined && bindings[0].abstract.value !== '') ? bindings[0].abstract.value : 'No information found for this plant in DBpedia'
        // plant.identification.dbpediaInfo.uri = bindings[0].plant.value;
        // plant.identification.dbpediaInfo.description = bindings[0].abstract.value;
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
      date: req.body.datetime,
      location: {
        coordinates: [req.body.latitude, req.body.longitude]
      },
      description : req.body.description,
      plantSize : {size:[req.body.plantSize_height,req.body.plantSize_spread]},
      haveFlower : (req.body.haveFlower === 'true'),
      haveLeaves : (req.body.haveLeaves === 'true'),
      haveSeeds : (req.body.haveSeeds === 'true'),
      sunExposure : req.body.sunExposure,
      flowerColor : req.body.flowerColor,
      identification : {
        name : req.body.name,
        status : req.body.status,
        suggestedNames : req.body.id_suggestedNames,
        // dbpediaInfo : {
        //   commonName : req.body.id_info_commonName,
        //   scientificName : req.body.id_info_scientificName,
        //   description : req.body.id_info_description,
        //   uri : req.body.id_info_uri,
        // }
      },
      photo : base64Image,
      userNickname : req.body.userNickname,
      userId : req.body.userId,
      isInMongoDB: true,
      isInIndexedDB: true,
      plantId: req.body.plantId
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

  plantId = req.query.plantId;
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0]



  console.log('/updatePlant => body: ', req.body);

  // plant.location.coordinates = [req.body.location.coordinates[0], req.body.location.coordinates[1]];
  // plant.description = req.body.description;
  // plant.plantSize = req.body.plantSize;
  // plant.haveFlower = (req.body.haveFlower===true);
  // plant.haveLeaves = (req.body.haveLeaves===true);
  // plant.haveSeeds = (req.body.haveSeeds===true);
  // plant.sunExposure = req.body.sunExposure;
  // plant.flowerColor = req.body.flowerColor;
  plant.identification.name = req.body.identification.name;
  plant.identification.status = req.body.identification.status;
  // plant.identification.suggestedNames = req.body.identification.suggestedNames;
  //plant.identification.dbpediaInfo.commonName = req.body.id_info_commonName;
  //plant.identification.dbpediaInfo.scientificName = req.body.id_info_scientificName;
  //plant.identification.dbpediaInfo.description = req.body.id_info_description;
  //plant.identification.dbpediaInfo.uri = req.body.id_info_uri;


  // plant.userNickname = req.body.userNickname;
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

function retrievePlantName(plantName){

  plantName = plantName.replace(/_/g, ' ')
  plantName = plantName.replace(/\s+/g, ' ')
  return plantName
}

module.exports = router;
