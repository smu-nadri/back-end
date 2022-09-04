const mongoose = require('mongoose');

const {Schema} = mongoose;
const tags = new Schema({
    userID: String,
    _id: {
        type: Number,
        unique: true,
    },
    name_en: {
        type: String
    },
    name_ko: {
        type: String
    },
    cnt: {
        type: Number,
        default: 0
    }
});

module.exports = tags;