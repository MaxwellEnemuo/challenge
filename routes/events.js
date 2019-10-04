var express = require("express");
var router = express.Router();
const Conn = require("../config/dbConn");
const EventModel = require("../models/eventModel");
const ActorModel = require("../models/actorModel");
const RepoModel = require("../models/repoModel");
const conn = new Conn("./config/table.db");
const eventModel = new EventModel(conn);
const actorModel = new ActorModel(conn);
const repoModel = new RepoModel(conn);

router.post("/", function(req, res, next) {
  var event = req.body;
  var actor = event.actor;
  var repo = event.repo;

  var p = eventModel
    .get(event.id)
    .then(event => {
      if (event) {
        res.status(400).json();
        return p.cancel();
      } else {
        return null;
      }
    })
    .then(() => actorModel.get(actor.id))
    .then(row =>
      !row ? actorModel.insert(actor.id, actor.login, actor.avatar_url) : null
    )
    .then(() => repoModel.get(repo.id))
    .then(row => (!row ? repoModel.insert(repo.id, repo.name, repo.url) : null))
    .then(() =>
      eventModel.insert(
        event.id,
        event.type,
        actor.id,
        repo.id,
        event.created_at
      )
    )
    .then(() => res.status(201).json())
    .catch(err => next(err));
});

router.get("/", function(req, res, next) {
  eventModel
    .all()
    .then(rows => {
      var events = [];
      rows.forEach(row => {
        events.push({
          id: row.id,
          type: row.type,
          actor: {
            id: row.actor_id,
            login: row.login,
            avatar_url: row.avatar_url
          },
          repo: {
            id: row.repo_id,
            name: row.name,
            url: row.url
          },
          created_at: row.created_at
        });
      });
      res.status(200).json(events);
    })
    .catch(err => {
      console.log("ERR EVENTS ROUTER", err);
      return next(err);
    });
});

router.get("/actors/:id", function(req, res, next) {
  var id = req.params.id;

  var p = actorModel
    .get(id)
    .then(row => {
      if (!row) {
        res.status(404).end();
        return p.cancel();
      }

      return null;
    })
    .then(() => eventModel.getAllByActorId(id))
    .then(rows => {
      var events = [];
      rows.forEach(row => {
        events.push({
          id: row.id,
          type: row.type,
          actor: {
            id: row.actor_id,
            login: row.login,
            avatar_url: row.avatar_url
          },
          repo: {
            id: row.repo_id,
            name: row.name,
            url: row.url
          },
          created_at: row.created_at
        });
      });
      res.status(200).json(events);
    })
    .catch(err => {
      return next(err);
    });
});

module.exports = router;
