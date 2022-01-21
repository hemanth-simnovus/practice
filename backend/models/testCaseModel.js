var mongoose = require('mongoose');

var database = require("./../connections/database_connection").getDb();

var testCaseSchema = new mongoose.Schema({
  user:{
    type: String,
    required: true 
  },
  testCaseName: { 
    type: String, 
    required: true 
  },
  configFile:{
    type: Object
  },
  intermediateObject: {
    type: Object,
    require: true
  },
  tags:[],
  description:{
    type:String
  },
  ueSimId:{
    type:Number,
    default:1,
    select:true
  },
  status:{
    type:String,
    enum:['running','not-running','aborted'],
    default:'not-running'
  },
  executionHistory: [
    {
      time: {
        type: String,
        required: true,
      },
      result: {
        type: String,
        enum: ["success", "fail", "abort"],
      },
      duration: {
        type: String,
        default: "0",
      },
      remarks: {
        type: String,
      },
    },
  ],
  editHistory: [
    {
      time: {
        type: String,
        required: true,
      },
      comments: {
        type: String,
      },
    },
  ]
}, { autoIndex: false, timestamps: true });


testCaseSchema.post('findOneAndUpdate',async function (doc,next) {
  console.log("comming");
  console.log(doc.status);
  if (doc.status === 'aborted') {
    console.log("set time out for aborted state and update status to not running");
  }
  next();
});


module.exports = database.mainDB.model('TestCase', testCaseSchema);
