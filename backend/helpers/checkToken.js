const userModel = require("./../models/userModel");
const GlobalError =require('./globalError');
const createErrorObj = require('./createErrorObj');

//Checking existing session of the user
module.exports = async function checkToken(req, res, next) {
  if (!req.session.user) {
    let arrError =[];
    arrError.push(createErrorObj("You are not logged in ! please log in to get access","UnauthorizedError"));
    return next(new GlobalError(arrError,401));
  }

  const currentUser = await userModel.findById(req.session.user);

  if (!currentUser) {
    let arrError =[];
    arrError.push(createErrorObj("The user belonging to this token does not longer exits","UnauthorizedError"));
    return next(new GlobalError(arrError,401));
  }
  // if (currentUser.changePasswordAfter(decode.iat)) {
  //    return next(new GlobalError('user change password recently , please login again!!',401));
  // }
  console.log("**** current user***");
  console.log(currentUser);
  console.log("*******");
  req.user = currentUser;
  next();
};
