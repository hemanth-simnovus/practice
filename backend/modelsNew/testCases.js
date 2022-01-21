var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
// const validator = require('validator');

var testCaseSchema = new mongoose.Schema( {
    testcaseName: {
      type: String,
      required: [true, "Please provide testcase name"],
      trim: true,
      unique: true,
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      // validate: [validator.isAlphanumeric, 'Please provide a valid is test cases name']
    },
    status: {
      type: String,
      enum: {
        values: ["running", "not-running", "aborted"],
        message: "testcase status is either: running, not-running, aborted"
      },
      default: "not-running",
    },
    // userGroupList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userGroups' }],
    // ueSimList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ueSim' }],
    executionHistory: [
      {
        time: { type: String, required: true }, /// startTime
        result: { type: String, required: true },
        duration: { type: Number, required: true }, // startTime+duration=endTime
        remarks: { type: String},
        ueSimId: { type: mongoose.Schema.Types.ObjectId, ref: 'ueSim' },
        // testlog: { type: mongoose.Schema.Types.ObjectId, ref: 'testLog' },
        // testUEStats: { type: mongoose.Schema.Types.ObjectId, ref: 'testUEStats' },
        // testCellStats: { type: mongoose.Schema.Types.ObjectId, ref: 'testCellStats' }
      },
    ],
    editHistory: [
      {
        time: { type: String, required: true },
        comment: { type: String},
      }
    ],
    executionSchedule: [
      {
        time: { type: String, required: true },
        ueSimID: { type: Number, required: true },
        frequency : {type:String}
      }
    ],
    intermediateObject: {
      tags: [{ type: String }],
      description: { type: String },
      cellConfig: {
        master: {},
        cells: [{}],
      },
      subsConfig: {
        master: {},
        subs: [{}],
      },
      userplaneConfig: {
        master: {},
        profiles: [{}],
      },
      powerCycleConfig: {
        master: {},
        profiles: [{}],
      },
      mobilityConfig: {
        master: {},
        profiles: [{}],
      },
      loggingConfig: {
        layer: {},
        displayCrpto: { type: Boolean },
        displaySecurity: { type: Boolean },
        saveSignal: { type: Boolean },
      },
      stopConfig: {},
    },
    createdAt: {
        type: Date, required: true, default: Date.now 
    }
});

testCaseSchema.plugin(uniqueValidator,{ type: 'mongoose-unique-validator' });

module.exports = testCaseSchema;
