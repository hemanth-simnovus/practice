var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var layer =new mongoose.Schema({
    "time": {type: Number},
    "message": {type : String},
    "cpu utilisation":{type: Number},
    "cells": {},
    "nas":{type:Array},
    "rrc":{type:Array},
    "message_id": {type: Number},
    "arrivalDate": { type: Date }
});
var layer2to5 =new mongoose.Schema({
    "time": {type: Number},
    "message": {type : String},
    "cpu utilisation":{type: Number},
    "cells": {},
    "message_id": {type: Number},
    "arrivalDate": { type: Date }
});

var layers={};
layers[1] = database.mainDB.model('celllayer1', layer);
layers[2] = database.mainDB.model('celllayer2', layer2to5);
layers[3] = database.mainDB.model('celllayer3', layer2to5);
layers[4] = database.mainDB.model('celllayer4', layer2to5);
layers[5] = database.mainDB.model('celllayer5', layer2to5);

module.exports=layers
