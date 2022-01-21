var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var database = require("./../connections/database_connection").getDb();

var userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "please tell your full name"],
  },
  email: {
    type: String,
    required: [true, "please provide your email"],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 8,
    select: false,
  },
  userRole: {
    type: String,
    enum: ["admin", "creator", "executor", "both"],
    default: "creator",
  },
  ueSim: {
    type: Number,
    default: 1,
  },
  userGroup: {
    type: String,
  },
  //   licence: {
  //     type: String,
  //   }
  // createdBy: {
  //      type: String
  //     },
  // lastLogin: {
  //      type: String
  //     },
  // status: {
  //      type: Number,
  //       default: 0
  //     }
});

//userSchema.set('toJSON', { virtuals: true });

// ***************middleware for password encryption  *****************
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

//***************middleware function for password verification during login  *****************
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = database.mainDB.model("User", userSchema);

module.exports = User;