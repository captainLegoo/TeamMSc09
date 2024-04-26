const mongoose = require('mongoose');

let PlantSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    location: {
        // type: {
        //     type: String,
        //     enum: ['Point'],
        //     required: true
        // },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: {
        type: String,
        required: true
    },
    plantSize: {
        type: String,
        required: true
    },
    haveFlower: {
        type: Boolean,
        required: true
    },
    haveLeaves: {
        type: Boolean,
        required: true
    },
    haveSeeds: {
        type: Boolean,
        required: true
    },
    sunExposure: {
        type: String,
        enum: ['Full Sun', 'Partial Shade', 'Full Shade'],
        required: true
    },
    flowerColor: {
        type: String,
        enum: ['Red', 'Yellow', 'White', 'Purple', 'Orange', 'Green', 'Blue', 'Pink', 'Black', 'Other'],
        required: true
    },
    identification: {
        name: {
            type: String,
            default: "Unknown"
        },
        status: {
            type: String,
            enum: ['Completed', 'In-progress'],
            default: 'In-progress'
        },
        suggestedNames: [{
            type: String
        }],
        dbpediaInfo: {
            commonName: {
                type: String
            },
            scientificName: {
                type: String
            },
            description: {
                type: String
            },
            uri: {
                type: String
            }
        }
    },
    photo: {
        type: String,
        required: true
    },
    userNickname: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    comment : [
        {
            data:{
                type:Date,default:Date.now
            },
            msg:{
                type:String
            }
        }
    ]
});
// PlantSchema.index({ location: '2dsphere' });
let PlantModel = mongoose.model('plants', PlantSchema);

module.exports = PlantModel;
