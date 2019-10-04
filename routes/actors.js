var express = require("express");
var router = express.Router();
const Conn = require("../config/dbConn");
const ActorModel = require("../models/actorModel");
const EventModel = require("../models/eventModel");
const moment = require("moment");
const conn = new Conn("./config/table.db");
const actorModel = new ActorModel(conn);

router.put("/", function(req, res, next) {
  var actor = req.body;

  var p = actorModel
    .get(actor.id)
    .then(row => {
      if (!row) {
        res.status(404).end();
        return p.cancel();
      } else if (actor.login != row.login) {
        res.status(400).end();
        return p.cancel();
      }

      return null;
    })
    .then(() => actorModel.update(actor.id, actor.login, actor.avatar_url))
    .then(() => res.status(200).end())
    .catch(err => next(err));
});

router.get("/", function(req, res, next) {
  var p = actorModel
    .getAllWithMostEvents()
    .then(rows => {
      var actors = [];
      rows.forEach(actor => {
        actors.push({
          id: actor.id,
          login: actor.login,
          avatar_url: actor.avatar_url
        });
      });
      res.status(200).json(actors);
    })
    .catch(err => next(err));
});

router.get("/streak", function(req, res, next) {
  const temp_conn = new Conn(":memory:");
  const temp_actorModel = new ActorModel(temp_conn);
  const eventModel = new EventModel(conn);

  var calcStreak = actor => {
    return new Promise((resolve, reject) => {
      eventModel.getAllByActorId(actor.id, true).then(events => {
        var streak = 0;
        var maxStreak = 0;
        var lastEvent = null;
        for (i = 0; i < events.length; i++) {
          if (
            lastEvent == null ||
            moment(lastEvent).isBefore(moment(events[i].created_at))
          ) {
            lastEvent = events[i].created_at;
          }
          if (i == 0) {
            streak++;
            continue;
          }

          let momentPrev = moment(events[i - 1].created_at);
          let momentCurr = moment(events[i].created_at);
          momentPrev = moment(momentPrev.format("YYYY-MM-DD"));
          momentCurr = moment(momentCurr.format("YYYY-MM-DD"));
          let diff = momentCurr.diff(momentPrev, "days");

          if (diff == 1) streak++;
          else streak = 0;

          if (maxStreak <= streak) maxStreak = streak;
        }

        resolve(
          temp_actorModel.insertTempStreak(
            actor.id,
            actor.login,
            actor.avatar_url,
            maxStreak,
            lastEvent
          )
        );
      });
    });
  };

  var p = temp_actorModel
    .createTemp()
    .then(() => actorModel.all())
    .then(actors => Promise.all(actors.map(calcStreak)))
    .then(() => temp_actorModel.getAllStreaks())
    .then(streaks => {
      var sanitized = [];
      streaks.forEach(streak =>
        sanitized.push({
          id: streak.id,
          login: streak.login,
          avatar_url: streak.avatar_url
        })
      );
      return sanitized;
    })
    .then(sanitized => res.status(200).json(sanitized))
    .catch(err => next(err));
});

module.exports = router;
