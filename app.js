var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var sqlite = require("sqlite3").verbose();
var fs = require("fs");

var index = require("./routes/index");
var eraseEvents = require("./routes/eraseEvents");
var events = require("./routes/events");
var actors = require("./routes/actors");

const EventModel = require("./models/eventModel");
const ActorModel = require("./models/actorModel");
const RepoModel = require("./models/repoModel");

const Promise = require("bluebird");
const Conn = require("./config/dbConn");
const conn = new Conn("./config/table.db");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

fs.unlink("./config/table.db", err => {
  const eventModel = new EventModel(conn);
  const actorModel = new ActorModel(conn);
  const repoModel = new RepoModel(conn);

  eventModel
    .create()
    .then(() => actorModel.create())
    .then(() => repoModel.create());
});

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/erase", eraseEvents);
app.use("/events", events);
app.use("/actors", actors);

app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
