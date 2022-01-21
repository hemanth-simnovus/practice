var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();

var logSchema = new mongoose.Schema({
    // testcaseName : { type: Schema.Types.ObjectId, ref: 'user'},
    // ueSimId : { type: Schema.Types.ObjectId, ref: 'ueSim' },
    testcaseName : { type: String},
    ueSimId : { type: Number },
    message: {type: Object, required: false},
    logs: {type: Object, required: false},
    message_id: { type: Number, required: false },
    arrivalDate: { type: Date, required: false },
    expiryDate: { type: Date, required: false }
});

module.exports = logSchema;

// module.exports = database.mainDB.model('userLog', logSchema);