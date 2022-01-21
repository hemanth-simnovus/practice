var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var statsSchema = new mongoose.Schema({
  "message": {},
  "time": {},
  "cpu": {},
  "instance_id": {},
  "cells": {},
  "counters": {
    "messages": {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  "message_id": {},
  "arrivalDate": { type: Date }
});

module.exports = database.mainDB.model('Stats', statsSchema);