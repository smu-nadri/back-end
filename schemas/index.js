const mongoose = require("mongoose");

const connect = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "testDB",
        useNewUrlParser: true
    })
    .then(() => console.log("Connection to CosmodDB"))
    .catch((err) => console.error(err));
}

module.exports = connect;