const express = require("express");
const mongoose = require("mongoose");

const indexRoute = require("./route/index");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");

const adminRoute = require("./route/admin");
const productRoute = require("./route/product");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Accept,Content-Type,Authorization"
  );

  next();
});

app.use("/api", indexRoute);
app.use("/api", productRoute);
app.use("/api", adminRoute);
app.use((req, res, next) => {
  throw new HttpError("could not found the route", 404);
});

app.use((error, req, res, next) => {
  if (req.file) {
    const path = "uploads/images/" + req.file.filename;
    fs.unlink(path, (err) => console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unkwon error occured!!" });
});

mongoose
  .connect(
    `mongodb+srv://IRAHULSAH:86242@cluster0-7sht0.mongodb.net/ecommerce`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to Database");
    app.listen(process.env.port || 80);
  })
  .catch((err) => console.log(err));
