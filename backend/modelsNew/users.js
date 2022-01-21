var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var passwordValidator = require('password-validator');
var uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');

var passwordSchema = new passwordValidator();

passwordSchema
.is().min(6)                                    
.is().max(12)                                  
.has().uppercase()                              
.has().lowercase()                                  
.has().digits(2)                                    
.has().not().spaces()                               
.is().not().oneOf(['Password123', 'Simnovus123',]);  


var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide email"],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  userName: {
    type: String,
    required: [true, "Please provide userName"],
    lowercase: true,
    unique: true,
    match: [/^[a-zA-Z0-9]+$/, "Please provide a valid is user name"],
    // validate: [validator.isAlphanumeric, 'Please provide a valid is user name']
  },
  fullName: {
    type: String,
    required: [true, "Please provide name"],
    trim: true,
  },
  userRole: {
    type: String,
    lowercase: true,
    enum: {
      values: ["admin", "creator", "executor", "both"],
      message: "{VALUE} is not a valid user role",
    },
    default: "creator",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    trim: true,
    validate: {
      validator: function (v) {
        return passwordSchema.validate(v);
      },
      message: "invalid password format",
    },
  },
  loginAttempt: {
    type: Number,
    required: true,
    default: 0,
  },
  session: [
    {
      login: { type: Date, required: [true, "Please provide login time"] },
      logout: { type: Date, required: [true, "Please provide logout time"] },
      testsExecuted: { type: Number },
      testsEdited: { type: Number },
      testsScheduled: { type: Number },
    },
  ],
  logSettings: [
    {
      logProfileName: {
        type: String,
        // unique: true,
        required: [true, "Please provide log setting profile name "],
      },
      settings: {
        type: Object,
        required: [true, "Please provide log settings "],
      },
    },
  ],
  status: {
    type: String,
    enum: ["active", "deactive", "archieved"],
    default: "active",
  },
  userGroupList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userGroups' }],
  ueSimList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ueSims' }],
});

// ***************middleware for password encryption  *****************
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});
// userSchema.pre('updateOne', async function() {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
// });

// ***************middleware function for password verification during login  *****************
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.plugin(uniqueValidator,{ type: 'mongoose-unique-validator' });

// let users = mongoose.model('users',userSchema)

module.exports = userSchema;



//// passwordConfirm