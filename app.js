const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");

const connect = require("./schemas");
const indexRouter = require("./routes/index");
const albumRouter = require("./routes/album");
const searchRouter = require("./routes/search");
const highlightRouter = require("./routes/highlight");
const statsRouter = require("./routes/stats");

dotenv.config();

const app = express();
app.set("port", process.env.PORT || 8080);

app.use(morgan("dev"));
app.use(express.json());

app.use("/", indexRouter);
app.use("/api/album", albumRouter);
app.use("/api/search", searchRouter);
app.use("/api/highlight", highlightRouter);
app.use("/api/stats", statsRouter);

connect();

app.listen(app.get("port"), () => {
    console.log(app.get("port"), '번 포트에서 대기 중');
});