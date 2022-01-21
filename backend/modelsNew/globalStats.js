var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var testGlobalStatsSchema = new mongoose.Schema({
    // testcaseName : { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    // ueSimId : { type: mongoose.Schema.Types.ObjectId, ref: 'ueSim' },
    testcaseName : { type: String},
    ueSimId : { type: Number },
    message: {},
    time: {},
    cpu: {},
    instance_id: {},
    global: {
      cells:{
         throughput:{},
          packets:{},
          mcs:{},
      },
      messages:{}
    },
    message_id: {},
    arrivalDate: { type: Date }
});

module.exports = testGlobalStatsSchema;

// module.exports = database.mainDB.model('testStats', testGlobalStatsSchema);

//email_stats
///email_uestats
//email_logs

// per user 
//     per ue

//hemath (2)
    //email_ue1_stats
    ///email_ue1_uestats
    //email_ue1_logs

    //email_ue2_stats
    ///email_ue2_uestats
    //email_ue2_logs

// shridhar (1)
    //email_ue1_stats
    ///email_ue1_uestats
    //email_ue1_logs

    ///

    // Document -CRUD 
    // SubDocumnet - CRUD