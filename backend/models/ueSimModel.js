var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var profileSchema = new mongoose.Schema({
    "simId":{type:Number, required:true},
    "ipAddress":{type:String, required:true},
    "profileName":"",
    "user":"",
    "status":{
        type:String,
        enum:['running','available'],
        default:'available'
        }
    }, { autoIndex: false });

module.exports = database.mainDB.model('ueSim', profileSchema);
