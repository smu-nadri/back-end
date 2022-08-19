const mongoose = require('mongoose');

const {Schema} = mongoose;
const tags = new Schema({
    userID: String,
    tag1: {
        type: Number,
        default: 0
    },
    tag2: {
        type: Number,
        default: 0
    }
});

module.exports = tags;