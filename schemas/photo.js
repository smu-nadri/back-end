const mongoose = require("mongoose");

const {Schema} = mongoose;
const photo = new Schema({
    uri: {
        type: String
    },
    datetime: {
        type: Date
    },
    location: {
        type: Object    
    },
    thumbnail: {
        type: String
    },
    tags: [
        { 
            type: Object,
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
    page: {
        pageOrder: {
            type: Number
        },
        layoutOrder: {
            type: Number,
            index: true,
        }
    },  
}, {
    timestamps: true,
});

module.exports = photo;