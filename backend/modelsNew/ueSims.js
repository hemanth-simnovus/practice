var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();
var validators = require('validator')
var uniqueValidator = require('mongoose-unique-validator');

var ueSimSchema = new mongoose.Schema({
    ueSimId:{
        type: Number,
        required: true,
        unique: true,
        // validate: [validators.isEmpty, 'ueSimId is empty']
    },
    IP: {
        type: String,
         required: true,
         unique: true,
         validate:[validators.isIP,'Please Provide a Valid IP Address']
        }, 
    host: {type: String, required: false}, 
    // userName: {
    //     type: String,
    //     required: [true,'userName is required'],
    //     lowercase: true,
    //     unique: true,
    //     validate: [validators.notEmpty, 'userName is empty'],
    //     match: [/^[a-zA-Z0-9]+$/, 'is invalid'] 
    // },
    password: {
        type: String,
        trim: true,
    },
    status:{
        type:String,
        enum:['running','available'],
        default:'available'
        },
    ueInfo: {
        software: {
            ueVersion: {type: String, required: true},
            os: {
                distribution: {type: String, required: true},
                version: {type: String, required: true},
                kernel: {type: String, required: true}
            },
            license: {
                type: {
                    type: String, 
                    required: true,
                    enum: {
                        values: ['fixed', 'floating', 'dongle'],
                        message: '{VALUE} license type is not supported'
                        }
                    },
                expiryDate: {type: Date, required: true},
                noOfUes: {type: Number, required: true},
                ratType: {type: String, required: true}
            }
        },
        hardware:{
            board:{
                manufacturer: {type: String, required: true},
                productName: {type: String, required: true}
            },
            cpu:{
                manufacturer: {
                  type: String,
                  enum: {
                      values: ['Intel'],
                      message: '{VALUE} processor is not supported'
                  }
                },
                family: {type: String, required: true},
                version: {type: String, required: true},
                speed: {type: String, required: true},
                cores: {
                    type: Number, 
                    required: true,
                    min: [18, 'Must be at least 18, got {VALUE}']
                },
                threadsPerCore: {
                    type: Number, 
                    required: true,
                    min: [2, 'Must be at least 2, got {VALUE}'],
                },
            },
            memory:{
                total: { 
                    type: Number
                },
                used: { 
                    type: Number
                },
                available: { 
                    type: Number
                }
            },
            rf:[
                {
                    boardID: {type: String, required: true},
                    deviceName: {type: String, required: true},
                    versionSW: {type: String, required: true},
                    versionFPGA: {type: String, required: true}
                }
            ]
        }
    },
    // users: [
    //     {
    //       type: mongoose.Schema.ObjectId,
    //       ref: 'User'
    //     }
    //   ]
  });
  
ueSimSchema.plugin(uniqueValidator);

module.exports = ueSimSchema;
// module.exports = database.mainDB.model('ueSim', ueSimSchema);