var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const validator = require("validator");

const userModel = require("./../models/userModel");

function init(router) {
  router.route("/login").post(login).get(getLogin);
  //router.route('/forgotPassword').post(forgotPassword);
  //router.route('/recoverPassword').post(recoverPassword);
  //router.route('/recoveryChangePassword').post(recoveryChangePassword);
  // router.route('/authenticate').post(authenticate);
}

// user login ////
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Please provide email",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Please provide a password",
        });
      }
    }
    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 characters or more.",
      });
    }
    const user = await userModel.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Incorrect email",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }
    }
    req.session.user = user._id;
    res.status(200).json({
      success: true,
      message: "Login successful.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

function getLogin(req, res) {
  if (req.session.user) {
    let temp = {
      // email: req.session.user._doc.emailAddress,
      _id: req.session.user,
      //userName: req.session.user._doc.userName
    };
    res.status(200).send({ loggedIn: true, data: temp });
  } else {
    res.status(200).send({ loggedIn: false });
  }
}

// function authenticate(req,res){
//   const body = req.body;
//   let temp=jwt.decode(body.token,"secret simnovus");
//   if(body.token == null || body.email == null){
//     res.send({status: 500, success:false, message: 'Email or token is not provided'});
//   }
//   else if(temp!=null){
//     if(temp.email == body.email){
//       commonFunctions.getUserDirSize('./dir/'+body.email).then( async (size)=>{
//         userModel.findByIdAndUpdate(body._id,{$set : {dir_size: size}}).then(async (updated)=>{
//           res.send({status:200,success:true, message: 'User successfully authenticated'});
//         })
//       }).catch(e=>{
//         res.send({status:200,success:false, message: e});
//       });
//     }
//     else{
//       res.status(200).send({status: 200, success:false, message: 'User authentication failed'});
//     }
//   }
//   else{
//     res.status(200).send({status: 200, success:false, message: 'User authentication failed'});
//   }
// }

// function forgotPassword(req, res) {
//   const body = req.body;
//   if (body.emailAddress) {
//     userModel.findOne({ emailAddress: body.emailAddress }, (err, result) => {
//       if (err) {
//         return res.status(200).send({ success: false, message: err });
//       }
//       if (result) {
//         let temp = jwt.sign({ id: result._id }, "secret simnovus");
//         res.send({ success: true, data: { sQues1: result.sQues1, sQues2: result.sQues2, _id: result._id, token: temp } })
//       }
//       else {
//         res.send({ success: false, message: 'Not found' })
//       }
//     }).catch(e => {
//       res.status(500).send({ success: false, message: e });
//     })
//   }
//   else {
//     res.status(500).send({ success: false, message: 'No email address received' });
//   }
// }

// function recoverPassword(req, res) {
//   const body = req.body;
//   if (body._id && body.sAns1 && body.sAns2 && body.token) {
//     userModel.findOne({ _id: body._id }, (err, result) => {
//       if (err) {
//         return res.status(200).send({ success: false, message: err });
//       }
//       let checkToken = jwt.decode(body.token, "secret simnovus");
//       if (checkToken.id == body._id) {
//         if (result) {
//           let temp = jwt.sign({ id: body._id }, "secret simnovus");
//           if (result.sAns1 === body.sAns1 && result.sAns2 === body.sAns2) {
//             res.send({ success: true, token: temp })
//           }
//           else {
//             res.send({ success: false, message: "Invalid answers provided" })
//           }
//         }
//         else {
//           res.send({ success: false, message: "User not found" })
//         }
//       }
//       else {
//         res.send({ success: false, message: "Invalid token provided" })
//       }
//     }).catch(e => {
//       res.send({ success: false, message: e })
//     })
//   }
//   else {
//     res.status(500).send({ success: false, message: 'Required details not received' });
//   }
// }

// function recoveryChangePassword(req, res) {
//   const body = req.body;
//   if (body._id && body.token && body.password) {
//     let temp = jwt.decode(body.token, "secret simnovus");
//     if (temp.id == body._id) {
//       userModel.findByIdAndUpdate(body._id, { password: bcrypt.hashSync(body.password, 10) }, (err, result) => {
//         if (err) {
//           return res.send({ success: false, message: "Unable to update. Try again after sometime" });
//         }

//         res.send({ success: true, message: "Successfully updated" });
//       })
//     }
//     else {
//       res.send({ success: false, message: "Invalid token provided" })
//     }
//   }
//   else {
//     res.status(500).send({ success: false, message: 'Required details not received' });
//   }
// }

module.exports.init = init;
