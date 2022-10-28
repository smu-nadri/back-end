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
        type: Date
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
            id: Number,
            label: String,
            distance: Number,
            embeeding: String,
            left: Number,
            top: Number,
            right: Number,
            bottom: Number
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