var express = require('express');
var router = express.Router();

const PlantModel = require('../model/PlantModel');
const {Double} = require("mongodb");
var plantController = require("../controllers/plant_controller");

const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

/**
 * @swagger
 * /:
 *   get:
 *     summary: Render single plant page
 *     description: Renders the singlePlant page.
 *     responses:
 *       200:
 *         description: Successfully rendered the singlePlant page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>...</html>"
 *       500:
 *         description: Internal server error.
 */
router.get('/',function (req, res){
  res.render('singlePlant')
})

/**
 * @swagger
 * /editPlant:
 *   get:
 *     summary: Render edit plant page
 *     description: Renders the editPlant page.
 *     responses:
 *       200:
 *         description: Successfully rendered the editPlant page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>...</html>"
 *       500:
 *         description: Internal server error.
 */
router.get('/editPlant',function (req, res){
  res.render('editPlant')
})

/**
 * @swagger
 * /addPlant:
 *   get:
 *     summary: Render add plant page
 *     description: Renders the addPlant page.
 *     responses:
 *       200:
 *         description: Successfully rendered the addPlant page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>...</html>"
 *       500:
 *         description: Internal server error.
 */
router.get('/addPlant',function (req,res){
  res.render('addPlant')
})

/**
 * @swagger
 * /singlePlantData:
 *   get:
 *     summary: Retrieve single plant data with additional DBpedia information
 *     description: Fetches data for a single plant by its ID and enriches it with information from DBpedia.
 *     parameters:
 *       - in: query
 *         name: plantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the plant to retrieve.
 *     responses:
 *       200:
 *         description: A single plant's data with DBpedia information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 identification:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dbpediaInfo:
 *                       type: object
 *                       properties:
 *                         uri:
 *                           type: string
 *                           description: URI of the plant in DBpedia.
 *                         description:
 *                           type: string
 *                           description: Description of the plant from DBpedia.
 *               example:
 *                 identification:
 *                   name: "Aloe Vera"
 *                   dbpediaInfo:
 *                     uri: "http://dbpedia.org/resource/Aloe_vera"
 *                     description: "Aloe vera is a succulent plant species of the genus Aloe."
 *       400:
 *         description: Bad request. Missing or invalid plantId parameter.
 *       404:
 *         description: Plant not found.
 *       500:
 *         description: Internal server error.
 */

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
        res.json(plant)
      }).
  catch( error => {
    plant.identification.dbpediaInfo.uri = '';
    plant.identification.dbpediaInfo.description = '';
    console.log('Failed to fetch uri')
    res.json(plant)
  });

});

/**
 * @swagger
 * /addPlant:
 *   post:
 *     summary: Add a new plant entry
 *     description: Adds a new plant entry with various details including an uploaded photo.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo of the plant in PNG format.
 *               datetime:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the plant observation.
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude of the plant location.
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude of the plant location.
 *               description:
 *                 type: string
 *                 description: Description of the plant.
 *               plantSize_height:
 *                 type: number
 *                 format: float
 *                 description: Height of the plant.
 *               plantSize_spread:
 *                 type: number
 *                 format: float
 *                 description: Spread of the plant.
 *               haveFlower:
 *                 type: string
 *                 description: Indicates if the plant has flowers. Use 'true' or 'false'.
 *               haveLeaves:
 *                 type: string
 *                 description: Indicates if the plant has leaves. Use 'true' or 'false'.
 *               haveSeeds:
 *                 type: string
 *                 description: Indicates if the plant has seeds. Use 'true' or 'false'.
 *               sunExposure:
 *                 type: string
 *                 description: Sun exposure of the plant.
 *               flowerColor:
 *                 type: string
 *                 description: Color of the flowers.
 *               name:
 *                 type: string
 *                 description: Name of the plant.
 *               status:
 *                 type: string
 *                 description: Status of the plant.
 *               id_suggestedNames:
 *                 type: string
 *                 description: Suggested names for the plant.
 *               userNickname:
 *                 type: string
 *                 description: Nickname of the user adding the plant.
 *               userId:
 *                 type: string
 *                 description: ID of the user adding the plant.
 *               plantId:
 *                 type: string
 *                 description: ID of the plant.
 *     responses:
 *       200:
 *         description: Plant added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: {}
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       500:
 *         description: Internal server error.
 */

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

/**
 * @swagger
 * /updatePlant:
 *   post:
 *     summary: Update plant information
 *     description: Updates the identification name and status of a plant based on its ID.
 *     parameters:
 *       - in: query
 *         name: plantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the plant to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identification:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The new name of the plant.
 *                   status:
 *                     type: string
 *                     description: The new status of the plant.
 *     responses:
 *       200:
 *         description: Plant updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Plant updated successfully."
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       404:
 *         description: Plant not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/updatePlant', async (req, res)=>{

  plantId = req.query.plantId;
  const result = await plantController.getSinglePlant(plantId);
  const plant = result[0]

  console.log('/updatePlant => body: ', req.body);

  plant.identification.name = req.body.identification.name;
  plant.identification.status = req.body.identification.status;

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

/**
 * @swagger
 * /add-comment:
 *   post:
 *     summary: Add a comment to a plant
 *     description: Adds a comment to a specific plant based on its ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The ID of the plant to add the comment to.
 *               comment:
 *                 type: string
 *                 description: The content of the comment.
 *               name:
 *                 type: string
 *                 description: The name of the person making the comment.
 *     responses:
 *       200:
 *         description: Comment added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: {}
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       404:
 *         description: Plant not found.
 *       500:
 *         description: Internal server error.
 */

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

/**
 * Retrieves the name of a plant in valid format.
 * @param plantName The un-formatted name of the plant
 * @returns {String} The formatted name of the plant
 */
function retrievePlantName(plantName){

  plantName = plantName.replace(/_/g, ' ')
  plantName = plantName.replace(/\s+/g, ' ')
  return plantName
}

module.exports = router;
