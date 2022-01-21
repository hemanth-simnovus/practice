var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var ueSchema = new mongoose.Schema({
  "message": {},
  "time": {},
  "ue_list": {},
  "arrivalDate": { type: Date, unique: true }
}, { autoIndex: false });

module.exports = database.mainDB.model('ue_get', ueSchema);