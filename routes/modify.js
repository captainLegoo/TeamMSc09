var express = require('express');
var router = express.Router();


const PlantModel = require('../model/PlantModel');
const {Double} = require("mongodb");
var plantController = require("../controllers/plant_controller");

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

  fetchData('Peony').then(results => {
    plant.identification.dbpediaInfo.uri = results[0].uri;
    plant.identification.dbpediaInfo.description = results[0].abstract;
    res.json(plant)
  }).catch(error => {
    console.log("fetch dbpedia error: "+error)
    res.json(plant)
  });
});

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
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0]
  console.log(plant)
  plant.comment.push({msg:comment});
  await plant.save();
  res.json({})
})

function fetchData(query_name) {
  const endpointUrl = 'https://dbpedia.org/sparql';
  const query = `SELECT ?plant ?abstract WHERE {
  ?plant rdfs:label "${query_name}"@en;
         a dbo:Plant;
         dbo:abstract ?abstract.
  FILTER (lang(?abstract) = 'en')
} LIMIT 1`;

  return new Promise(async (resolve, reject) => {
    try {
      const bindingsStream = await fetcher.fetchBindings(endpointUrl, query);
      const results = [];

      bindingsStream.on('data', (bindings) => {
        results.push({
          uri: bindings.plant.value,
          abstract: bindings.abstract.value
        })
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

// ADD PLANT
// router.post('/addPlant',upload.single('photo'),function (req,res){
//   fs.readFile(req.file.path, (err, data) => {
//     let base64Image = data.toString('base64');
//     const plant = new PlantModel({
//       date: new Date(),
//       location: {
//         coordinates: [req.body.latitude, req.body.longitude]
//       },
//       description : req.body.description,
//       plantSize : req.body.plantSize,
//       haveFlower : (req.body.haveFlower === 'true'),
//       haveLeaves : (req.body.haveLeaves === 'true'),
//       haveSeeds : (req.body.haveSeeds === 'true'),
//       sunExposure : req.body.sunExposure,
//       flowerColor : req.body.flowerColor,
//       identification : {
//         name : req.body.name,
//         status : req.body.id_status,
//         suggestedNames : req.body.id_suggestedNames,
//         dbpediaInfo : {
//           commonName : req.body.id_info_commonName,
//           scientificName : req.body.id_info_scientificName,
//           description : req.body.id_info_description,
//           uri : req.body.id_info_uri,
//         }
//       },
//       photo : base64Image,
//       userNickname : req.body.userNickname,
//       userId : req.cookies.userId,
//       plantId: (new Date().getTime() * 1000 + Math.floor(Math.random() * 1000)).toString()
//     });
//
//     plant.save()
//         .then(() => {
//           console.log('new plant add successfully!');
//           res.render('success',{title:'successfully added'})
//         })
//         .catch((err) => {
//           console.error('failed to add new plant', err);
//           res.render('success',{title:'failed to add'});
//         });
//   });
// })
//
// router.get('/addPlant',function (req,res){
//   res.render('addPlant')
// })
//
// // UPDATE PLANT
// router.post('/updatePlant', async (req, res)=>{
//   const _id = req.body._id;
//   const plant = await PlantModel.findById(_id);
//   if (!plant) {
//     return res.status(404).json({message: 'Plant not found'});
//   }
//   plant.location.coordinates = [req.body.latitude, req.body.longitude];
//   plant.description = req.body.description;
//   plant.plantSize = req.body.plantSize;
//   plant.haveFlower = (req.body.haveFlower==='true');
//   plant.haveLeaves = (req.body.haveLeaves==='true');
//   plant.haveSeeds = (req.body.haveSeeds==='true');
//   plant.sunExposure = req.body.sunExposure;
//   plant.flowerColor = req.body.flowerColor;
//   plant.identification.name = req.body.name;
//   plant.identification.status = req.body.id_status;
//   plant.identification.suggestedNames = req.body.id_suggestedNames;
//   plant.identification.dbpediaInfo.commonName = req.body.id_info_commonName;
//   plant.identification.dbpediaInfo.scientificName = req.body.id_info_scientificName;
//   plant.identification.dbpediaInfo.description = req.body.id_info_description;
//   plant.identification.dbpediaInfo.uri = req.body.id_info_uri;
//
//   plant.userNickname = req.body.userNickname;
//   await plant.save();
//
//   res.render("success", {title: "update plant successfully"})
// })
//
// // router.get('/plants', async (req, res) => {
// //   try {
// //     const allPlants = await PlantModel.find({});
// //     res.send(allPlants);
// //     //res.status(200).json(allPlants);
// //   } catch (error) {
// //     console.error('Error fetching plant records:', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // });
//
// // /* GET home page. */
// router.get('/',function (req, res){
//   res.render('singlePlant')
// })
// router.get('/view', async (req, res) => {
//     const querySegment = req.url.split('?')[1];
//     const plantId = querySegment.split('=')[1];
//     const plant = await plantController.getSinglePlant(plantId);
//     res.json(plant[0]);
// });
//
// router.get('/edit',async (req,res) => {
//   // const querySegment = req.url.split('?')[1];
//   // const plantId = querySegment.split('=')[1];
//   // const plant = await plantController.getSinglePlant(plantId);
//   // res.json(plant[0]);
//   // const _id = req.params._id;
//   // const urlObj = url.parse(req.url, true);
//   // const query = urlObj.query;
//   // try {
//   //   const plant = await PlantModel.findById(query._id);
//   //   if (!plant) {
//   //     return res.status(404).json({message: 'Plant not found'});
//   //   }
//   //   const query_name = ( plant.identification.dbpediaInfo.commonName==='')?plant.identification.dbpediaInfo.scientificName:plant.identification.dbpediaInfo.commonName
//   //   fetchData(query_name).then(results => {
//   //     res.render('editPlant',{data:plant,url:results});
//   //   }).catch(error => {
//   //     res.render('editPlant',{data:plant,url:''});
//   //   });
//   //
//   // } catch (error) {
//   //   console.error('Error fetching plant records:', error);
//   //   res.status(500).json({ message: 'Internal server error' });
//   // }
//   res.render('editPlant')
// })
//
// router.post('/add-comment', async (req,res) => {
//   const _id = req.body._id;
//   const _comment = req.body.comment;
//
//   const plant = await PlantModel.findById(_id);
//   plant.comment.push({msg:_comment});
//   await plant.save();
//   const allPlants = await PlantModel.findById(_id);
//
//   res.render('addPlant',{data:allPlants});
// })
//
// function fetchData(query_name) {
//   const endpointUrl = 'https://dbpedia.org/sparql';
//   const query = `SELECT * WHERE { ?athlete rdfs:label "${query_name}"@en } LIMIT 1`;
//
//   return new Promise(async (resolve, reject) => {
//     try {
//       const bindingsStream = await fetcher.fetchBindings(endpointUrl, query);
//       const results = [];
//
//       bindingsStream.on('data', (bindings) => {
//         Object.keys(bindings).forEach(key => {
//           results.push(bindings[key].value);
//         });
//       });
//
//       bindingsStream.on('end', () => {
//         console.log('finish loading data.');
//         resolve(results);
//       });
//
//       bindingsStream.on('error', (error) => {
//         console.error('stream err:', error);
//         reject(error);
//       });
//     } catch (error) {
//       console.error('fetching err', error);
//       reject(error);
//     }
//   });
// }

module.exports = router;
