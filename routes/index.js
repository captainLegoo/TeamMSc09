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

const newPlant = new plant({
  name: 'Rose',
  author: 'Botanist123',
  geolocation: 'Garden',
  description: 'A beautiful flowering plant',
  outward: [{
    height: 50,
    size: 30,
    distribution: 'Widespread'
  }],
  features: [{
    hasFlower: true,
    hasLeaf: true,
    hasSeed: true,
    Sun: 'Full sun',
    FlowerColor: 'Red'
  }],
  tags: [{
    name: 'Flower',
    identify: 'Rose'
  }],
  pictureUrl: 'https://example.com/rose.jpg'
});

// 保存到数据库
newPlant.save()
    .then(() => {
      console.log('New plant record created successfully!');
    })
    .catch((err) => {
      console.error('Error creating plant record:', err);
    });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Randy' });
});



module.exports = router;
