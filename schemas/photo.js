const mongoose = require("mongoose");

const {Schema} = mongoose;
const photo = new Schema({
    userId: {
        type: String,
        index: true
    },
    uri: {
        type: String
    },
    datetime: {
        type: Date,
        index: true
    },
    location: {
        type: Object    
    },
    tags: [
        { 
            type: Object,
        }
    ],
    faces: [
        {
            faceId: String,
            name: String,
            left: Number,
            top: Number,
            width: Number,
            height: Number
        }
    ],
    comment: {
        type: String
    },
    album: {
        title: {
            type: String
        },
        type: {
            type: String,
            enum: ["dateAlbum", "customAlbum"]
        },
        thumbnail: {
            type: String,
        }
    },
    layoutOrder: {
        type: Number,
        index: true,
    },  
}, {
    timestamps: true,
});

module.exports = photo;