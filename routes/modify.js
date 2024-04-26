var express = require('express');
var router = express.Router();

const url = require('url');
const PlantModel = require('../model/PlantModel');
const {Double} = require("mongodb");
// const URI = "mongodb+srv://lhuang50:huang123_@cluster0.ihtm3iq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoose = require('mongoose');
const path = require('path');

const SparqlEndpointFetcher = require('fetch-sparql-endpoint').SparqlEndpointFetcher;
const DataFactory = require('rdf-data-factory').DataFactory;

const fetcher = new SparqlEndpointFetcher({
  method: 'POST',
  additionalUrlParams: new URLSearchParams({ infer: 'true', sameAs: 'false' }),
  defaultHeaders: new Headers({ 'Accept': 'application/sparql-results+json' }),
  fetch,
  dataFactory: new DataFactory(),
  prefixVariableQuestionMark: false,
  timeout: 5000,
});

const fs = require('fs');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
// mongoose.connect(URI)
//     .then((result)=> console.log('connect successfully'))
//     .catch((error) => console.log(error))

// ADD PLANT
router.post('/addPlant',upload.single('photo'),function (req,res){
  let base64Image = '';
  //console.log("222")
  // console.log(req.file);
  console.log(req.file)
  fs.readFile(req.file.path, (err, data) => {
    base64Image = data.toString('base64');
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
          res.render('home',{title:'successfully added'})
        })
        .catch((err) => {
          console.error('Error creating plant record:', err);
          res.render('home',{title:'failed to add'});
        });
  });
  // console.log(base64Image)




})

router.get('/addPlant',function (req,res){
  res.render('addPlant')
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
  plant.identification.name = req.body.name;
  plant.identification.status = req.body.id_status;
  plant.identification.suggestedNames = req.body.id_suggestedNames;
  plant.identification.dbpediaInfo.commonName = req.body.id_info_commonName;
  plant.identification.dbpediaInfo.scientificName = req.body.id_info_scientificName;
  plant.identification.dbpediaInfo.description = req.body.id_info_description;
  plant.identification.dbpediaInfo.uri = req.body.id_info_uri;
  //plant.photo = req.body.photo;
  plant.userNickname = req.body.userNickname;

  await plant.save();
  //res.redirect('home');
  res.render("home")
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
    const allPlants = await PlantModel.findById('662928a624119266a5d177fd');
    res.render('singlePlant',{data:allPlants,title:'randy'});
  } catch (error) {
    console.error('Error fetching plant records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/edit',async (req,res) => {
  const _id = req.params._id;
  console.log("id is"+_id)
  const urlObj = url.parse(req.url, true);
  const query = urlObj.query;
  const id = query._id;
  console.log(query._id);
  try {
    //http://localhost:3000/modify/edit?_id=65ef932e7f392acbffefa873
    const plant = await PlantModel.findById(query._id);
    if (!plant) {
      return res.status(404).json({message: 'Plant not found'});
    }

    //const query_name = plant.identification.dbpediaInfo.commonName
    const query_name = ( plant.identification.dbpediaInfo.commonName==='')?plant.identification.dbpediaInfo.scientificName:plant.identification.dbpediaInfo.commonName
    fetchData(query_name).then(results => {
      res.render('editPlant',{title:'aaa',data:plant,url:results});
    }).catch(error => {
      console.error("Error fetching results:", error);
    });

    //res.render('edit',{title:'aaa',data:plant,url:''});
    //res.render('editPlant',{title:'aaa',data:plant});
    
  } catch (error) {
    console.error('Error fetching plant records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.post('/add-comment', async (req,res) => {
  const _id = req.body._id;
  const _comment = req.body.comment;
  console.log(_id)
  console.log(_comment)
  console.log("ok")
  const plant = await PlantModel.findById(_id);
  plant.comment.push({msg:_comment});
  await plant.save();
  const allPlants = await PlantModel.findById(_id);

  res.render('addPlant',{data:allPlants,title:'randy'});
})

function fetchData(query_name) {
  const endpointUrl = 'https://dbpedia.org/sparql';
  const query = `SELECT * WHERE { ?athlete rdfs:label "${query_name}"@en } LIMIT 1`;

  // Create a new promise that will handle the completion of the data collection
  return new Promise(async (resolve, reject) => {
    try {
      const bindingsStream = await fetcher.fetchBindings(endpointUrl, query);
      const results = []; // This array will collect all results

      bindingsStream.on('data', (bindings) => {
        // For each piece of data (bindings), collect all results
        Object.keys(bindings).forEach(key => {
          results.push(bindings[key].value);
        });
      });

      bindingsStream.on('end', () => {
        console.log('All data has been received.');
        resolve(results); // Resolve the promise with all collected results once the stream ends
      });

      bindingsStream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error); // Reject the promise on stream error
      });
    } catch (error) {
      console.error('Error fetching data from DBpedia:', error);
      reject(error); // Reject the promise on fetching error
    }
  });
}

module.exports = router;
