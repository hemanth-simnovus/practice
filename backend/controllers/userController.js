const validator = require("validator");
const userModel = require("./../models/userModel");
const GlobalError =require('../helpers/globalError');
const createErrorObj = require('../helpers/createErrorObj');

exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      if (!email) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide email",undefined,"email"));
        return next(new GlobalError(arrError,400));
      } else {
        let arrError =[];
        arrError.push(createErrorObj("Please provide a password",undefined,"password"));
        return next(new GlobalError(arrError,400));
      }
    }
    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      let arrError =[];
        arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
        return next(new GlobalError(arrError,400));
    }
    if (password.length < 8) {
      let arrError =[];
        arrError.push(createErrorObj("Password must be 8 characters or more.",undefined,"password"));
        return next(new GlobalError(arrError,400));
    }
    const user = await userModel.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      if (!user) {
        let arrError =[];
        arrError.push(createErrorObj("Incorrect email","UnauthorizedError","email"));
        return next(new GlobalError(arrError,401));
      } else {
        let arrError =[];
        arrError.push(createErrorObj("Incorrect password","UnauthorizedError","password"));
        return next(new GlobalError(arrError,401));
      }
    }
    req.session.user = user._id;
    res.status(200).json({
      message: "Login successful.",
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};
exports.logout = async (req, res,next) => {
  req.session.destroy((err) => {
    if (err) {
      let arrError =[];
      arrError.push(createErrorObj("Could not log out","authenticationError"));
      return next(new GlobalError(arrError,500));
    } else {
      res.status(200).json({
        message: "Logout successful.",
      });
    }
  });
};

exports.createUser = async (req, res, next) => {
  try {
    let { email, password, userRole, fullName } = req.body;
    if (!email || !password || !fullName) {
      if (!email) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide email",undefined,"email"));
        return next(new GlobalError(arrError,400));
      } else if (!fullName) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide full name",undefined,"fullName"));
        return next(new GlobalError(arrError,400));
      } else {
        let arrError =[];
        arrError.push(createErrorObj("Please provide password",undefined,"email"));
        return next(new GlobalError(arrError,400));
      }
    }
    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }
    if (password.length < 8) {
      let arrError =[];
      arrError.push(createErrorObj("Password must be 8 characters or more.",undefined,"password"));
      return next(new GlobalError(arrError,400));
    }
    if (userRole || userRole === "") {
      userRole = userRole.trim().toLowerCase();
      let roles = ["admin", "creator", "executor", "both"];
      if (!roles.includes(userRole)) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide a valid user role",undefined,"userRole"));
        return next(new GlobalError(arrError,400));
      }
    }
    userModel.countDocuments({ email }, async (err, result) => {
      if (err) {
        let arrError =[];
        arrError.push(createErrorObj("signup database is not found",null));
        return next(new GlobalError(arrError,500));
      }
      if (result == 0) {
        const newUser = await userModel.create(
          {
            email,
            password,
            fullName,
            userRole,
          },
          async (err, result) => {
            if (err) {
              let arrError =[];
              arrError.push(createErrorObj("User addition not successful",null));
              return next(new GlobalError(arrError,500));
            } else {
              res.status(201).json({
                message: "User addition successful",
              });
            }
          }
        );
      } else {
        let arrError =[];
        arrError.push(createErrorObj("email already exists, please provide another email","conflictError","email"));
        return next(new GlobalError(arrError,409));
        }
    });
  } catch (e) {
    //console.log(e);
    res.status(500).json({
      message: "Something went wrong...!",
    });
  }
};

//Getting a list of all the users present in database
exports.getAllUsers = async (req, res, next) => {
  try {
    await userModel.find({}, { _id: 0, __v: 0 }, (err, usersList) => {
      if (usersList) {
        res.status(200).json({
          results: usersList.length,
          usersList,
        });
      } else {
        return res.status(500).json({
          message: "Something went wrong.",
        });
      }
    });
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

//Getting a perticular user details
exports.getUser = async (req, res, next) => {
  try {
    let email = req.params.email;
    if (!email) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }
    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }
    await userModel.find({ email }, { _id: 0, __v: 0 }, (err, user) => {
      if (user) {
        if (user.length == 0) {
          let arrError =[];
          arrError.push(createErrorObj("no user found with this email","authenticationError","email"));
          return next(new GlobalError(arrError,404));
        }
        res.status(200).json({
          user,
        });
      } else {
        return res.status(500).json({
          message: "Something went wrong.",
        });
      }
    });
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    let query = req.params.email;
    let { email, password, userRole } = req.body;
    let userData = req.body;

    if (!query) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }

    query = query.trim().toLowerCase();

    if (!validator.isEmail(query)) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }
    if (password) {
      let arrError =[];
      arrError.push(createErrorObj("This route is not for password update. Please use /updatePassword.",null));
      return next(new GlobalError(arrError,400));
    }
    if (userRole || userRole === "") {
      userRole = userRole.trim().toLowerCase();
      let roles = ["admin", "creator", "executor", "both"];
      if (!roles.includes(userRole)) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide a valid user role",undefined,"userRole"));
        return next(new GlobalError(arrError,400));
        }
    }
    userModel.countDocuments({ email }, async (err, result) => {
      if (!result) {
        await userModel.findOneAndUpdate(
          { email: query },
          userData,
          (err, result) => {
            console.log(result);
            if (err) {
              return res.status(500).json({
                message: "Something went wrong.",
              });
            }
            if (result) {
              return res.status(200).json({
                message: "User updated sucessfully",
              });
            } else {
              let arrError =[];
              arrError.push(createErrorObj("No user Found","authenticationError",null));
              return next(new GlobalError(arrError,404));
            }
          }
        );
      } else {
        let arrError =[];
        arrError.push(createErrorObj("Email already exists ,please provide another email.","conflictError","email"));
        return next(new GlobalError(arrError,409));
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    let email = req.params.email;
    if (!email) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }
    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
      return next(new GlobalError(arrError,400));
    }
    await userModel.findOneAndRemove({ email }, { new: true }, (err, doc) => {
      console.log(doc);
      if (err) {
        let arrError =[];
        arrError.push(createErrorObj("No user found with this email.","authenticationError","email"));
        return next(new GlobalError(arrError,404));
      }
      if (doc) {
        return res.status(200).json({
          message: "User deleted successfully",
        });
      } else {
        let arrError =[];
        arrError.push(createErrorObj("No user found with this email.","authenticationError","email"));
        return next(new GlobalError(arrError,404));
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    let { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      if (!currentPassword) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide current password",undefined,"currentPassword"));
        return next(new GlobalError(arrError,400));
      } else {
        let arrError =[];
        arrError.push(createErrorObj("Please provide new password",undefined,"newPassword"));
        return next(new GlobalError(arrError,400));
      }
    }
    if (currentPassword.length < 8 || newPassword.length < 8) {
      let arrError =[];
      arrError.push(createErrorObj("Password must be 8 characters or more.",undefined,"password"));
      return next(new GlobalError(arrError,400));
    }
    const user = await userModel.findById(req.user._id).select("+password");
    if (!(await user.correctPassword(currentPassword, user.password))) {
      let arrError =[];
        arrError.push(createErrorObj("your current password is wrong","UnauthorizedError","password"));
        return next(new GlobalError(arrError,401));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      message: "Password Successfully changed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.validEmail = (req, res, next) => {
  let email = req.params.email;
  if (!req.params) {
    let arrError =[];
      arrError.push(createErrorObj("Please provide email",undefined,"email"));
      return next(new GlobalError(arrError,400));
  }
  email = email.trim().toLowerCase();
  if (!validator.isEmail(email)) {
    let arrError =[];
    arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
    return next(new GlobalError(arrError,400));
  }
  next();
};

exports.modifyUser = async (req, res, next) => {
  try {
    let email = req.params.email;
    const { modifyType, password, userRole, suspend } = req.body;
    if (!modifyType) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide modifyType",undefined,"modifyType"));
      return next(new GlobalError(arrError,400));
    }
    let type = ["resetPassword", "suspend", "roleChange"];
    if (type.includes(modifyType)) {
      if (modifyType === "resetPassword") {
        if (!password || password.length < 8) {
          let arrError =[];
          arrError.push(createErrorObj("Password must be 8 characters or more.",undefined,"password"));
          return next(new GlobalError(arrError,400));
        }

        let user = await userModel.findOne({ email });

        user ? (user.password = password)
        : res.status(400).json({ message: "No user found with this email." });
        await user.save();
        res.status(200).json({
          message: "Password reset successful",
        });
      }
    } else {
      let arrError =[];
          arrError.push(createErrorObj("Please provide valid modifyType",undefined,"modifyType"));
          return next(new GlobalError(arrError,400));
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
      error: error,
    });
  }
};

exports.modifyUsers = async (req, res, next) => {
  try {
    const { modifyType, password, userRole, suspend } = req.body;
    if (!modifyType) {
      let arrError =[];
      arrError.push(createErrorObj("Please provide modifyType",undefined,"modifyType"));
      return next(new GlobalError(arrError,400));
    }
    let emails = req.body.emails;
    let invalidEmails = emails.filter((email) => {
      email = email.trim().toLowerCase();
      if (!validator.isEmail(email)) {
        return email;
      }
    });
    if (invalidEmails.length || !emails.length) {
      return res.status(400).json({
        message: "Please provide valid email",
        emails: invalidEmails,
      });
    }

    let type = ["resetPassword", "suspend", "roleChange"];

    if (type.includes(modifyType)) {
      let emailsFound = [];
      let emailsNotFound = [];
      for (let i = 0; i< emails.length; i++) {
        let found = await userModel.exists({ email: emails[i] });
        found
          ? emailsFound.push(emails[i])
          : emailsNotFound.push(emails[i]);
      }
      if (modifyType === "resetPassword") {
        if (!password || password.length < 8) {
          let arrError =[];
          arrError.push(createErrorObj("Password must be 8 characters or more.",undefined,"password"));
          return next(new GlobalError(arrError,400));
        }
        let modified = await userModel.updateMany(
          { email: emails },
          { password: password }
        );
        return res.status(200).json({
          message: "users modified successfull",
          usersFound: modified.n,
          usersNotFound: emailsNotFound,
          modified:modified
        });
      }
    } else {
      let arrError =[];
      arrError.push(createErrorObj("Please provide a valid modifyType",undefined,"modifyType"));
      return next(new GlobalError(arrError,400));
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
      error: error,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { userName, email } = req.body
    if (!email && !userName) {
      let arrError =[];
        arrError.push(createErrorObj("Please provide email",undefined,"email"));
        arrError.push(createErrorObj("Please provide user name",undefined,"userName"));
        return next(new GlobalError(arrError,400));
    }
    if (!email) {
      let arrError =[];
        arrError.push(createErrorObj("Please provide email",undefined,"email"));
        return next(new GlobalError(arrError,400));
    }
    if (!userName) {
      let arrError =[];
        arrError.push(createErrorObj("Please provide user name",undefined,"userName"));
        return next(new GlobalError(arrError,400));
    }
    let Email = email.trim().toLowerCase();
    if (!validator.isEmail(Email)) {
      let arrError =[];
        arrError.push(createErrorObj("Please provide a valid email",undefined,"email"));
        return next(new GlobalError(arrError,400));
    }
    let user = await userModel.findOne({ email });
    if(user){
      return res.status(200).json({
        message: "Success.user found"
      })
    }else {
      let arrError =[];
      arrError.push(createErrorObj("User not found","authenticationError",null));
      return next(new GlobalError(arrError,404));
    }
  } catch (error) {
      return res.status(500).json({
        message: "Something went wrong.",
        error: error,
      });
  }
}