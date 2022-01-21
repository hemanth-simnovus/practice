const validator = require("validator");
const fs = require("fs");
const path = require("path");

const userModel = require("./../models/userModel");
const testCaseModel = require("../models/testCaseModel");
const ueSimModel = require("../models/ueSimModel");
const lteFunctions = require("../lteFunctions.js");
const GlobalError =require('../helpers/globalError');
const createErrorObj = require('../helpers/createErrorObj');

// getting all test cases from database
exports.getAllTestCases = async (req, res) => {
  try {
    await testCaseModel.find(
      {},
      {
        _id: 0,
        __v: 0,
        configFile: 0,
        intermediateObject: 0,
        user: 0,
      },
      (err, testCases) => {
        if (testCases) {
          res.status(200).json({
            results: testCases.length,
            testCases,
          });
        } else {
          return res.status(500).json({
            message: "Something went wrong.",
          });
        }
      }
    );
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.getTestCase = async (req, res,next) => {
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
    const user = await userModel.findOne({ email });
    if (!user) {
      let arrError =[];
      arrError.push(createErrorObj("Incorrect email","UnauthorizedError","email"));
      return next(new GlobalError(arrError,401));
    }

    await testCaseModel.find(
      { user: email },
      {
        _id: 0,
        __v: 0,
        configFile: 0,
        intermediateObject: 0,
        user: 0,
      },
      (err, result) => {
        if (result) {
          if (result.length === 0) {
            return res.status(200).json({
              message: "No prifiles found",
            });
          }
          res.status(200).json({
            profilesList: result,
          });
        }
      }
    );
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

// selecting config file and sending file to app manager for test case execution
exports.executeTestCase = async (req, res,next) => {
  try {
    let { ueSimID, testCaseName } = req.body;
    let baseType;
    let dataBaseProfileName;
    let carrierAggregation;
    if (!ueSimID || !testCaseName) {
      if (!ueSimID) {
        let arrError =[];
        arrError.push(createErrorObj("Please provide UE simulator Id",undefined,"ueSimID"));
        return next(new GlobalError(arrError,400));
      } else {
        let arrError =[];
        arrError.push(createErrorObj("Please provide test case name",undefined,"testCaseName"));
        return next(new GlobalError(arrError,400));
      }
    }
    if (typeof req.body.ueSimID !== "number") {
      let arrError =[];
      arrError.push(createErrorObj("Please provide a valid UE simulator Id",undefined,"ueSimID"));
      return next(new GlobalError(arrError,400));
    }
    // const ueDetails = await ueSimModel.findOne({ simId: ueSimID });
    // if (!ueDetails) {
    //   return res.status(404).json({
    //     message: "No UE simulator found with this ID",
    //   });
    // }

    testCaseName = testCaseName + ".json";
    let user = req.user.email;

    var pathDir = "../common/.threshold.txt";

    const directoryPath = path.join(__dirname, pathDir);
    if (fs.existsSync(directoryPath)) {
      //console.log('Found file');
      fs.readFile(directoryPath, "utf8", function (err, data) {
        // Display the file content
        //console.log(data);
        min_threshold = data;
      });
    } else {
      //console.log('Not Found ');
      min_threshold = 20;
    }

    var testCaseContent = await testCaseModel.find({user:email, testCaseName: testCaseName });
    if (testCaseContent.length == 0) {
      let arrError =[];
      arrError.push(createErrorObj("Test case not found",null,"testCaseName"));
      return next(new GlobalError(arrError,404));
    }
    profileContent.map((inter) => {
      dataBaseProfileName = inter.intermediateObject;
      //console.log(Object.keys(testCaseName)[4]);
      baseType = dataBaseProfileName[Object.keys(dataBaseProfileName)[4]];
      carrierAggregation =
        dataBaseProfileName[Object.keys(dataBaseProfileName)[5]];
    });
    console.log(baseType);
    console.log(carrierAggregation);
    lteFunctions.startLte(
      testCaseName,
      user,
      true,
      res,
      req,
      baseType,
      carrierAggregation,
      ueSimID
    );
  } catch (e) {
    res.status(500).send({ message: "Test Could not be started" });
    console.log("startUeSimulator error = " + e);
  }
  // res.status(200).send({message: 'Successfully started'});
};

//delete users
exports.deleteTestCase = async (req, res,next) => {
  try {
    let testCaseName = req.params.testCaseName;
    if (!testCaseName) {
      return res.status(400).json({
        message: "Please provide testCaseName",
      });
    }

    testCaseName = testCaseName.trim();
    testCaseName = testCaseName + ".json";

    console.log(testCaseName);
    const doc = await testCaseModel.findOneAndDelete({
      profileName: testCaseName,
    });
    if (!doc) {
      return res.status(404).json({
        message: "no test case found with this name",
      });
    }
    let filePath = path.join(
      __dirname,
      "../configuration_file/user@simnovus.com/" + testCaseName
    );
    await fs.unlinkSync(filePath);
    res.status(200).json({
      message: "Test case deleted successfully",
    });
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.summaryView = async (req, res,next) => {
  try {
    let query = req.params.testCaseName
    let testCaseName;
    (query.endsWith(".json")) ? testCaseName = query: testCaseName = query + '.json' ;
    let userName = req.user.email;
    if (!testCaseName) {
      return res.status(400).json({
        message: "Please provide testCaseName",
      });
    }
    
    await testCaseModel.find(
      {userName,profileName: testCaseName},
      {},
      (err, result) => {
        if (result) {
          if (result.length === 0) {
            return res.status(200).json({
              message: "No testCases found",
            });
          }
          res.status(200).json({
            testcase: {
              testCaseName: result[0].profileName.replace(".json",""),
              tags: ["string"],
              description: "string",
              testDuration: 0,
              summaryView: result[0].intermediateObject,
            },
          });
        } else {
          return res.status(200).json({
            message: "No testCase found",
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

exports.GetTestCaseHistory = async (req, res,next) => {
  try {  
    let query = req.params.testCaseName;
    let testCaseName;
    query.endsWith(".json")
      ? (testCaseName = query)
      : (testCaseName = query + ".json");
    await profileModel.findOne(
      {
        userName:req.user.email,
        profileName: testCaseName,
      },
       (err, doc) => {
        if (doc) {
          res.status(200).json({
            executionHistory: doc.executionHistory,
            editHistory:doc.editHistory
          });
        } else {
          res.status(404).json({
            message:"No test case found."
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong."
    });
  }
};