const mongoose = require("mongoose");

const connect = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "testDB",
        useNewUrlParser: true,
    })
    .then(() => console.log("Connection to CosmodDB"))
    .catch((err) => console.error(err));
};
mongoose.connection.on('error', (error) => {
    console.error('MongoDB Connection Error :', error);
});
mongoose.connection.on('disconnected', () => {
    console.error("MongoDB DisConnected. Retry Connection");
});

module.exports = connect;