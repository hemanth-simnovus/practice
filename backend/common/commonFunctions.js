const getSize = require("get-folder-size");
const loginModel = require("../models/userModel");
const ueSimModel = require("../models/ueSimModel");
const bcrypt = require("bcryptjs");
const WebSocket = require("ws");
const appManager = require("../appManager");
global.ws;

const commonFunctions = {
  getUserDirSize: getUserDirSize,
  checkForUser: checkForUser,
  checkForUE: checkForUE,
};

//Getting the current directory size of the path provided
function getUserDirSize(filePath) {
  return new Promise(async (resolve, reject) => {
    try {
      await getSize(filePath, async (err, size) => {
        if (err) {
          reject(err);
        }
        const temp = (size / 1024 / 1024 / 1024).toFixed(2);
        resolve(temp);
      });
    } catch (e) {
      reject(e);
    }
  });
}

//////////////////////////////////////////////////

//Checking if existing users are there in DB, if no users are created, one default admin user is created for user to be able to access the frontend
function checkForUser() {
  loginModel.countDocuments({}, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      if (res == 0) {
        // loginModel.create({ userName: 'Simnovus', emailAddress: 'user@simnovus.com', password: bcrypt.hashSync('simnovus', 10), user_type: 0, userRole: 'admin', createdBy: 'rootUser', lastLogin: new Date(), status: 0, sQues1: 1, sAns1: 'temp', sQues2: 2, sAns2: 'temp' }, function (err, post) {
        //   if (err) {
        //     console.log(err);
        //   }
        // })
        loginModel.create(
          {
            email: "user@simnovus.com",
            password: "simnovus",
            fullName: "Simnovus",
            userRole: "admin",
          },
          async (err, result) => {
            console.log(result);
            if (err) {
              console.log(err);
              return;
            }
            return;
          }
        );
      }
    }
  });
}

function checkForUE() {
  ueSimModel.countDocuments({}, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      if (res != 0) {
        console.log("re start ue");
        ueSimModel.find({}, { ipAddress: 1, _id: 0 }, (err, result) => {
          console.log(result[0].ipAddress);
          let appManagerPort = 8080;
          let ipAddress = result[0].ipAddress;
          ws = new WebSocket(
            "ws://" + ipAddress + ":" + appManagerPort + "/ws"
          );
          ws.on("open", function open() {
            console.log("node is connected to appManager");
            appManager.connect(ipAddress);
          });
          ws.on("close", function close() {
            console.log("appManager connection close");
          });

          ws.on("error", function error(e) {
            console.log("appManager websocket error");
          });
        });
      }
    }
  });
}
module.exports = commonFunctions;
