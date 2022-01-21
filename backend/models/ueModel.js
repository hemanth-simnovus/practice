var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var uelayer =new mongoose.Schema({
    "time": {type: Number},
    "message": {type : String},
    "cpu utilisation":{type: Number},
    "ue_list": {},
    "message_id": {type: Number},
    "arrivalDate": { type: Date }
});

var uelayers={};
uelayers[1] = database.mainDB.model('uelayer1', uelayer);
uelayers[2] = database.mainDB.model('uelayer2', uelayer);
uelayers[3] = database.mainDB.model('uelayer3', uelayer);
uelayers[4] = database.mainDB.model('uelayer4', uelayer);
uelayers[5] = database.mainDB.model('uelayer5', uelayer);

module.exports=uelayers
