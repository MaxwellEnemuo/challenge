var express = require("express");
var router = express.Router();

const Conn = require("../config/dbConn");
const EventModel = require("../models/eventModel");
const ActorModel = require("../models/actorModel");
const RepoModel = require("../models/repoModel");
const conn = new Conn("./config/table.db");

router.delete("/", function(req, res, next) {
  const eventModel = new EventModel(conn);
  const actorModel = new ActorModel(conn);
  const repoModel = new RepoModel(conn);

  eventModel
    .deleteAll()
    .then(() => actorModel.deleteAll())
    .then(() => repoModel.deleteAll())
    .then(events => res.status(200).end())
    .catch(err => next(err));
});

module.exports = router;
