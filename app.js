const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");

const indexRouter = require("./routes");
const connect = require("./schemas");

dotenv.config();

const app = express();
app.set("port", process.env.PORT || 80);

app.use(morgan("dev"));
app.use(express.json());
app.use("/", indexRouter);

connect();

app.listen(app.get("port"), () => {
    console.log(app.get("port"), '번 포트에서 대기 중');
});