var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();
const Schema = mongoose.Schema;

var messageSchema = new mongoose.Schema({
  arrivalDate: Number,
  messages: []
});

module.exports = database.mainDB.model('messageCounter', messageSchema);