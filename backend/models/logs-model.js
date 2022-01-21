var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

const logsSchema = new mongoose.Schema({
  "message": {},
  "logs": {},
  "message_id": { type: Number },
  "arrivalDate": { type: Number },
  "extraDate": { type: Number }
});

const logsModel = database.mainDB.model('logs', logsSchema);

// logsModel.ensureIndexes();
module.exports = logsModel;