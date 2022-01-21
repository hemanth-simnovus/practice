var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var testUeStatsSchema = new mongoose.Schema({
    // testcaseName : { type: Schema.Types.ObjectId, ref: 'user'},
    testcaseName : { type: String},
    ueSimId : { type: Number },
    // ueSimId : { type: Schema.Types.ObjectId, ref: 'ueSim' },
    message: {},
    time: {},
    cpu: {},
    instance_id: {},
    ues:{
        throughput:{},
        packets:{},
        mcs:{},
        messages:{}  /// not yet supported in app manager side 
     }, 
    message_id: {},
    arrivalDate: { type: Date }
});

module.exports = testUeStatsSchema;

// module.exports = database.mainDB.model('testStats', testUeStatsSchema);