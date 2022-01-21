var mongoose = require('mongoose');
var database = require("./../connections/database_connection").getDb();
var uniqueValidator = require('mongoose-unique-validator');
var validators = require('validator')

var userGroupsSchema = new mongoose.Schema({
    userGroupId:  {
        type: mongoose.Schema.ObjectId,
        required: true,
        unique: true,
        // validate: [validators.notEmpty, 'userGroupId is empty']
    },
    groupName: {
        type: String,
        required: [true,'groupName is required'],
        unique: true,  
        lowercase: true,
        // validate: [validators.notEmpty, 'groupName is empty'],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'] 
    },
    groupRole: {
        type: String,
        required: [true,'groupRole is required'],
        lowercase: true,
        // validate: [validators.notEmpty, 'groupRole is empty'],
        enum: {
            values: ["admin", "creator", "executor", "both"], 
            message: '{VALUE} is not supported role'
        }
    },
    // ueSimList : [{ type: mongoose.Schema.Types.ObjectId, ref: 'ueSim' }],
    users: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
    createdDate: {
        type: Date,
        required: false,
    }
});

// module.exports = database.mainDB.model('userGroup', userGroupsSchema);
userGroupsSchema.plugin(uniqueValidator);
module.exports = userGroupsSchema;
