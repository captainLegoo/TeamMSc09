var express = require('express');
var router = express.Router();

const url = require('url');
const PlantModel = require('../model/PlantModel');
const {Double} = require("mongodb");
const URI = "mongodb+srv://lhuang50:huang123_@cluster0.ihtm3iq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
mongoose.connect(URI)
    .then((result)=> console.log('connect successfully'))
    .catch((error) => console.log(error))

// ADD PLANT
router.post('/addPlant',upload.single('photo'),function (req,res){
  fs.readFile(req.file.path, (err, data) => {
    let base64Image = data.toString('base64');
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
      userNickname : req.body.userNickname,
      userId : req.cookies.userId
    });

    plant.save()
        .then(() => {
          console.log('new plant add successfully!');
          res.render('success',{title:'successfully added'})
        })
        .catch((err) => {
          console.error('failed to add new plant', err);
          res.render('success',{title:'failed to add'});
        });
  });
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

  plant.userNickname = req.body.userNickname;
  await plant.save();

  res.render("success", {title: "update plant successfully"})
})

// router.get('/plants', async (req, res) => {
//   try {
//     const allPlants = await PlantModel.find({});
//     res.send(allPlants);
//     //res.status(200).json(allPlants);
//   } catch (error) {
//     console.error('Error fetching plant records:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// /* GET home page. */
router.get('/', async (req, res) => {
    var userId = req.cookies.userId;
    if (userId == null) {
      res.redirect('/home');
      return;
    }
    const plantId = req.query.id;
    const allPlants = await PlantModel.findById(plantId);
    const query_name = ( allPlants.identification.dbpediaInfo.commonName==='')?allPlants.identification.dbpediaInfo.scientificName:allPlants.identification.dbpediaInfo.commonName
    const query_name2 = allPlants.identification.name;

    fetchData(query_name2).then(results => {
      res.render('singlePlant',{data:allPlants,url:results});
    }).catch(error => {
      res.render('singlePlant',{data:allPlants,url:''});
    });
});

router.get('/edit',async (req,res) => {
  const _id = req.params._id;
  const urlObj = url.parse(req.url, true);
  const query = urlObj.query;
  try {
    const plant = await PlantModel.findById(query._id);
    if (!plant) {
      return res.status(404).json({message: 'Plant not found'});
    }
    const query_name = ( plant.identification.dbpediaInfo.commonName==='')?plant.identification.dbpediaInfo.scientificName:plant.identification.dbpediaInfo.commonName
    fetchData(query_name).then(results => {
      res.render('editPlant',{data:plant,url:results});
    }).catch(error => {
      res.render('editPlant',{data:plant,url:''});
    });

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

  res.render('addPlant',{data:allPlants});
})

function fetchData(query_name) {
  const endpointUrl = 'https://dbpedia.org/sparql';
  const query = `SELECT * WHERE { ?athlete rdfs:label "${query_name}"@en } LIMIT 1`;

  return new Promise(async (resolve, reject) => {
    try {
      const bindingsStream = await fetcher.fetchBindings(endpointUrl, query);
      const results = []; // This array will collect all results

      bindingsStream.on('data', (bindings) => {
        Object.keys(bindings).forEach(key => {
          results.push(bindings[key].value);
        });
      });

      bindingsStream.on('end', () => {
        console.log('finish loading data.');
        resolve(results);
      });

      bindingsStream.on('error', (error) => {
        console.error('stream err:', error);
        reject(error);
      });
    } catch (error) {
      console.error('fetching err', error);
      reject(error);
    }
  });
}

module.exports = router;
