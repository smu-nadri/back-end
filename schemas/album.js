const mongoose = require("mongoose");

const {Schema} = mongoose;
const album = new Schema({
    title: { 
        type: String,
        unique: true,
    },
    albumTumbnail: String,
    albumType: {
        type: String,
        enum: ["dateAlbum", "customAlbum"]
    },
    imgCount: Number,
});

module.exports = album;