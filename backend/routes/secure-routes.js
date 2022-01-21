const fs = require('fs');
var express = require('express');
const system = require('system-commands');
const path = require('path')
const JSONStream = require('JSONStream');
const WebSocket = require('ws');
const validator=require('validator');

//require('../lte_socket.js');
var lteSocket = require('../lte_socket')
const authModel = require('../common/auth-model');
const userModel = require('../models/userModel');
const logsModel = require('./../models/logs-model');
const messageModel = require('./../models/message_model');
const testCaseModel = require('../models/testCaseModel');
const statsModel = require('../models/stats_model');
const statsFilter = require('../models/statsmodel');
const ueFilter = require('../models/ueModel');
const commonFunction = require('../common/commonFunctions');
const dataCollection = require('../common/data-collection');
const lteFunctions = require('../lteFunctions.js');
const appManager = require('../appManager.js');
const ueConnection =require('../connections/socket_parameters');
const r =require('../helpers/ristrictTo');
const ueSimModel =require('../models/ueSimModel');
// global.ws;

var routerExpress = express.Router();

async function init(router) {
    router.route('/createUser').post(r.ristrictTo('manager'),createUser);
    router.route('/getUsersList').get(r.ristrictTo('manager'),getUsersList);
    router.route('/getUser').get(r.ristrictTo('manager'),getUser);
    router.route('/editUser').patch(editUser);
    router.route('/deleteUser').delete(r.ristrictTo('manager'),deleteUser);
    router.route('/updateMyPassword').patch(updateMyPassword);
    router.route('/resetPassword').patch(r.ristrictTo('manager'),resetPassword);
    router.route('/logout').get(logout);

    router.route('/createProfile').post(createProfile);
    router.route('/getProfilesList').get(getProfilesList);
    router.route('/getFiles').post(getFiles);
    router.route('/getProfileStatus').get(getProfileStatus);
    
    router.route('/addUeSim').post(addUeSim);
    router.route('/getUeSimsList').get(getUeSimsList);

    router.route('/executeProfile').post(executeProfile);
    router.route('/stopProfile').post(stopProfile);
    
    router.route('/getGlobalStats').get(getGlobalStats);
    
    //// old api
    router.route('/blockUser').post(blockUser);
    //router.route('/startUeSimulator').post(startUeSimulator);
    //router.route('/stopUeSimulator').get(stopUeSimulator);
    router.route('/editProfile').post(editProfile);
    router.route('/deleteProfiles').post(deleteProfiles);
    router.route('/loadPreviousLogs').post(loadPreviousLogs);
    router.route('/saveCurrentLogs/:fileName').post(saveCurrentLogs);
    router.route('/saveExistingLogs').post(saveExistingLogs);
    router.route('/socketInfo').get(getSocketInfo).post(changeSocketInfo);
    router.route('/updateGainRequest').post(updateGain);
    router.route('/getUeStatsForRange').post(getUeStatsForRange);
    router.route('/getstatsStartTime').post(getstatsStartTime);
    router.route('/getMessageCounterData').post(getMessageCounterData);
    router.route('/getRfCardData').get(getRfCardData);
    router.route('/updatedRfCardData').get(updatedRfCardData);
    router.route('/getSystemInfo').get(getSystemInfo);

    router.route('/getPreviousStats').post(getPreviousStats);
    router.route('/getDataRange').get(getDataRange);
    router.route('/getAnyStats').post(getAnyStats);

}


timeArray=[1,3,9,27,81];
min_threshold=20;


dataToSend=[];

function setLayer(time)
{
	for(var i=0;i<timeArray.length;i++)
	{
	  if(time<=timeArray[i])
    {
    	return i+1
    }
	}
	return 5;
}

function sendData(res)
{
	if(dataToSend.length>0)
	{
		// console.log(dataToSend);
		res.send({ success: true, status: 200, data:dataToSend});
	}
	else
	{
		res.send({ success: true, status: 201, data:"Data not sufficient"});
	}
}

//Data filtered for the specified layer
async function filterSelectedLayerCellData(layer,startTime,endTime,res,callback)
{
  console.log("\nStart Time is : "+startTime);
  console.log("\nEnd Time is : "+endTime);
	var time1 = Date.parse(startTime);
  var time2 = Date.parse(endTime);
  console.log(layer)
  console.log("Min threshold : ",min_threshold);
  await statsFilter[layer].find({"arrivalDate": {$gte:time1,$lt:time2}},(err, result) => {
		 if (err)
		 {
			 console.log("Error : "+err);
			 res.send({ success: false,  status: 500, message: err });
		 }
		 else
		 {
			 // console.log(result);
			 var resLen=result.length;
			 console.log(resLen);
			 if(resLen<min_threshold)
			 {
			   console.log("\nFilter data for layer "+(layer)+" is less then minimum threshold ")
				 if(layer>1)
				 {
					layer=layer-1;
			   	filterSelectedLayerCellData(layer,startTime,endTime,res,callback);  /*fetch data for the decremented layer*/
					// return dataToSend;
				 }
				 else
				 {
				 	 console.log("Layer data too less");
            // console.log(res);
					 callback(res);
				 }
			 }
			 else
			 {
         dataToSend=[];
         // console.log(result);
				 for(var i=0;i<resLen;i++)
   	  	 {
           // result[i]['cells']=res[i]['cells'][graphType];
  				 dataToSend.push(result[i]);
   	     }
				 callback(res);
			 }
		 }
	 }).catch(e => {
		 		console.log("Error : "+e);
				res.send({success:false,status:500, message: "Internal error encountered"});
	 })
}

//Data filtered for the specified layer
async function filterSelectedLayerUeData(layer,startTime,endTime,res,callback)
{
  var time1= Date.parse(startTime);
  var time2= Date.parse(endTime);
  console.log("\nStart Time is : "+time1);
  console.log("\nEnd Time is : "+time2);
  console.log(layer)
  await ueFilter[layer].find({"arrivalDate": {$gte:time1,$lt:time2}},(err, result) => {
      if (err)
      {
        console.log("Error : "+err);
        res.send({ success: false,  status: 500, message: err });
      }
      else
      {
        var resLen=result.length;
        console.log("ResLEn : ",resLen);
        if(resLen<min_threshold)
        {
          console.log("\nFilter data for layer "+(layer)+" is less then minimum threshold ")
          if(layer>1)
          {
           layer=layer-1;
           filterSelectedLayerUeData(layer,startTime,endTime,res,callback);
          }
          else
          {
            console.log("Layer data too less");
            callback(res);
          }
        }
        else
        {
          dataToSend=[];
          for(var i=0;i<resLen;i++)
          {
            dataToSend.push(result[i]);
          }
          callback(res);
        }
      }
    }).catch(e => {
         console.log("Error : "+e);
         res.send({success:false,status:500, message: "Internal error encountered"});
    })
}

//Create the configFile
function createConfigFile(configFile,pathData,res)
{
    let generatedFile = fs.writeFile(pathData,JSON.stringify(configFile, null, 4),null,(err)=>{
        if (err)
        {
	          ////Console.log("File created as : "+generatedFile);
            res.send({ success: false, status:500, message: err })
        }
        else
        {
          res.send({success: true,status:200,message: 'Successfully started'});
        }
    });
}

//**************************************routes logic starts************************************************************ */
///new user creation
const createUser = async(req, res) => {
    try {
        let {email,password,userRole,firstName,lastName} =req.body;
        if(!email || !password || !firstName){
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message:"Please provide email"
                }); 
            }
            else if (!firstName) {
                return res.status(400).json({
                    success: false,
                    message:"Please provide first name"
                }); 
            } 
            else{
                return res.status(400).json({
                    success: false,
                    message:"Please provide password"
                });
            }
        }
        email=email.trim().toLowerCase();
        
        if (!(validator.isEmail(email))) {
            return res.status(400).json({
            success: false,
            message:"Please provide a valid email"
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
            success: false,
            message:"Password must be 8 characters or more."
            });  
        }
        if (userRole || userRole === '') {
            userRole=userRole.trim().toLowerCase();
            let roles=['manager','engineer']; 
            if (!roles.includes(userRole)) {
                return res.status(400).json({
                    success: false,
                    message:"Please provide a valid user role"
                  });
            } 
        }
        userModel.countDocuments({ email}, async(err, result) => {
            if (err) {
                return res.status(200).json({
                    success: false,
                    message:"signup database is not found"
                  });
            }
            if (result == 0) {
                const newUser=await userModel.create({
                    email,
                    password,
                    firstName,
                    lastName,
                    userRole
                },async (err, result) => {
                    if (err) { 
                        return res.status(500).json({
                            success: false,
                            message:"User addition not successful"
                          });
                    }else{
                        res.status(201).json({
                            success: true,
                            message:'User addition successful'
                        });
                    }
                });
            }
            else {
              return res.status(400).json({
                    success: false,
                    message: 'email already exists, please provide another email' 
                  });
            }
        })
    }
    catch (e) {
        //console.log(e);
        res.status(500).json({
            success: false,
            message: 'Something went wrong...!'
          });
    }
}

//Getting a list of all the users present in database
const getUsersList =async (req,res) => {
    try {
        await userModel.find({},{_id:0,__v:0},(err, usersList) => {
            if (usersList) {
                res.status(200).json({
                    success: true,
                    results:usersList.length,
                    usersList
                });  
            }else{
                return res.status(500).json({
                    success: false,
                    message:"Something went wrong."
                  });           
            }
        })    
    } catch (error) {
         //console.log(error);
     return res.status(500).json({
        success: false,
        message:"Something went wrong."
      }); 
    }
    
}

//Getting a perticular user details
const getUser =async (req,res) => {
    try {
        let {email} =req.body;
        if (!email) {
          return res.status(400).json({
            success: false,
            message:"Please provide email"
          });  
        }
        email=email.trim().toLowerCase();

      if (!(validator.isEmail(email))) {
        return res.status(400).json({
          success: false,
          message:"Please provide a valid email"
        });
      }
        await userModel.find({email},{_id:0,__v:0},(err, user) => {
            if (user) {
                if (user.length == 0) {
                    return res.status(404).json({
                        success: false,
                        message:"no user found with this email"
                    });
                }
                res.status(200).json({
                    success: true,
                    user
                });  
            }else{
                return res.status(500).json({
                    success: false,
                    message:"Something went wrong."
                  });           
            }
        })   
    } catch (error) {
         //console.log(error);
     return res.status(500).json({
        success: false,
        message:"Something went wrong."
      }); 
    }
}

//edit user information
const editUser = async(req,res) => {
    try {
        if (req.body.password || req.body.password === '') {
            return res.status(400).json({
                success: false,
                message:"This route is not for password update. Please use /updateMyPassword."
            });
          }

         // let {email,userRole,firstName,lastName} =req.body;
        if (req.user.userRole === 'manager') {
                if (!req.body.email) {
                    return res.status(400).json({
                        success: false,
                        message:"Please provide email"
                    }); 
                }
                req.body.email=req.body.email.trim().toLowerCase();
                if (!(validator.isEmail(req.body.email))) {
                    return res.status(400).json({
                    success: false,
                    message:"Please provide a valid email"
                    });
                }
                if (req.body.userRole || req.body.userRole === '') {
                    req.body.userRole=req.body.userRole.trim().toLowerCase();
                    let roles=['manager','engineer']; 
                    if (!roles.includes(req.body.userRole)) {
                        return res.status(400).json({
                            success: false,
                            message:"Please provide a valid user role"
                          });
                    } 
                }
                const doc = await userModel.findOneAndUpdate({email:req.body.email},req.body,{
                    new: true
                });
                if(!doc){
                return res.status(404).json({
                        success: false,
                        message:"No user found with this email address"
                    });
                }
                res.status(200).json({
                    success: true,
                    message:"User updated successfully."
                });
        }else{
            if (req.body.userRole) {
                return res.status(400).json({
                    success: false,
                    message:"Only an admin is allowed to change user role"
                });
            }
            if (req.body.email || req.body.email === '') {
                req.body.email=req.body.email.trim().toLowerCase();
                if (!(validator.isEmail(req.body.email))) {
                    return res.status(400).json({
                    success: false,
                    message:"Please provide a valid email"
                    });
                }
               await userModel.countDocuments({ email:req.body.email}, async(err, result) => {
                    if (err) {
                        return res.status(200).json({
                            success: false,
                            message:"signup database is not found"
                          });
                    }
                    if (result != 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'email already exists, please provide another email' 
                          });
                    }
                })
            }

            const updatedUser = await userModel.findByIdAndUpdate(req.user._id, req.body, {
                new: true
              });
            
              res.status(200).json({
                success: true,
                message:"User updated successfully."
            });

        }   
    } catch (error) {
        console.log(error);
     return res.status(500).json({
      success: false,
      message:"Something went wrong."
    });

       
    }
}

//delete users
const deleteUser = async (req,res) => {
    try {
        let {email} =req.body;
        if (!email) {
          return res.status(400).json({
            success: false,
            message:"Please provide email"
          });  
        }

      email=email.trim().toLowerCase();

      if (!(validator.isEmail(email))) {
        return res.status(400).json({
          success: false,
          message:"Please provide a valid email"
        });
      }
    
        const doc = await userModel.findOneAndDelete({email});
        if(!doc){
          return res.status(404).json({
                success: false,
                message:"no user found with this email"
            });
        }
        res.status(200).json({
            success: true,
           message:"User deleted successfully"
        });   
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            message:"Something went wrong."
        }); 
    }
}

//user can update his/her password
const updateMyPassword = async(req,res) => {
    try {
        let {currentPassword,newPassword}=req.body;
        if(!currentPassword || !newPassword){
          if (!currentPassword) {
            return res.status(400).json({
              success: false,
              message:"Please provide current password"
            });  
          }else{
            return res.status(400).json({
              success: false,
              message:"Please provide new password"
            });
          }
        }
        if (currentPassword.length < 8 || newPassword.length < 8) {
          return res.status(400).json({
            success: false,
            message:"Password must be 8 characters or more."
          });  
        }
        const user= await userModel.findById(req.user._id).select('+password');
        if (!(await user.correctPassword(currentPassword,user.password))) {
            return res.status(401).json({
                success: false,
                message:"your current password is wrong"
            });
        }
        user.password=newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message:"Password Successfully changed"
        });   
    } catch (error) {
         //console.log(error);
        return res.status(500).json({
            success: false,
            message:"Something went wrong."
        }); 
    }
}

//  reset user password
const resetPassword = async(req, res) => {
    try {
        let {email,password} =req.body;
        if(!email || !password){
          if (!email) {
            return res.status(400).json({
              success: false,
              message:"Please provide email"
            });  
          }else{
            return res.status(400).json({
              success: false,
              message:"Please provide password"
            });
          }
        }
        email=email.trim().toLowerCase();
  
        if (!(validator.isEmail(email))) {
          return res.status(400).json({
            success: false,
            message:"Please provide a valid email"
          });
        }
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            message:"Password must be 8 characters or more."
          });  
        }
      const user=await userModel.findOne({email}).select('+password');
      user.password=password;
      await user.save();
      res.status(200).json({
          success: true,
          message:"Password reset successful"
        });   
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            message:"Something went wrong."
        }); 
    }
}

//Deleting the session of the user and logout the user
function logout(req, res) {
    console.log(req.session.user);
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message:"Could not log out"
              });
        } else {
            res.status(200).json({
                success: true,
                message:"Logout successful."
            });
        }
    });
}

//new test case creation
async function createProfile(req, res)
{
    try
    {
        // console.log(req.body.tags);
        // console.log(req.body.description);
        let tags=req.body.tags;
        let description=req.body.description;
        var configFile=req.body.configFile;
        var fileName=req.body.fileName+".json";
        var intermediateObject = req.body.sendIntermediateObject;
	      ////Console.log('File name : '+fileName);
        var userName=req.body.userName;
        var fileType=req.body.fileType;
        //console.log("profile Type"+fileType);
        // console.log("intermediateObject : ",intermediateObject);
        if(configFile)
        {
          const userPath='../configuration_file/'+userName;
          const directoryPath = path.join(__dirname, userPath);
          var pathData=path.join(directoryPath,fileName);
          if(fs.existsSync(pathData) && fileType=="n")
          {
            return res.status(409).send({success:false, message: 'Profile name already assigned. Provide a unique name.'})
          }
          else
          {
            if(!fs.existsSync(directoryPath))
            {
              fs.mkdirSync(directoryPath);
            }
            if(fileType=='n')
            {
                testCaseModel.create({ userName: userName, profileName: fileName, configFile: configFile,intermediateObject: intermediateObject,filePath:pathData,tags:tags,description:description,ueSimId:1}, function (err, post) {
                    if (err) {
                        return res.send({ success: false, status: 500, message: err });
                    }
                console.log("Added entry for :",fileName);
                })
            }
            else
            {
                var myQuery={ userName: userName, fileName: fileName};
                await testCaseModel.findOne(myQuery, async(err ,proModel) => {
                    if (err) {
                        //console.log(err);
                        return res.send({ success: false, status: 500, message: err });
                    }
                    else if (proModel) {
                        var updateVal={$set:{configFile: configFile,intermediateObject: intermediateObject,filePath:pathData,tags:tags,description:description}};
                        await testCaseModel.updateOne(myQuery,updateVal, function (err, post) {
                            if (err) {
                                return res.send({ success: false, status: 500, message: err });
                             }
                            console.log("updated successfully");
                        })
                    }else if (!proModel) {
                      await testCaseModel.create({ userName: userName, profileName: fileName, configFile: configFile,intermediateObject: intermediateObject,filePath:pathData,tags:tags,description:description}, function (err, post) {
                            if (err) {
                                return res.send({ success: false, status: 500, message: err });
                            }
                        console.log("Added entry for :",fileName);
                        })
                    }
                })

            }
            createConfigFile(configFile,pathData,res);
          }
        }
        else
        {
            res.send({success:false, status : 404, message: 'Internal error encountered'})
        }

    }
    catch (e)
    {
        // console.log(e);
        res.status(500).send({success:false, message: e})
    }
}

// getting all test cases from database 
const getProfilesList =async (req,res) => {
    try {
        let query =req.user.email;
        if (req.user.userRole === 'manager' && (req.body.email || req.body.email === '')) {
            req.body.email=req.body.email.trim().toLowerCase();
                if (!(validator.isEmail(req.body.email))) {
                    return res.status(400).json({
                    success: false,
                    message:"Please provide a valid email"
                    });
                }
                const user=await userModel.findOne({email:req.body.email});
                  if (!user) {
                    return res.status(401).json({
                      success: false,
                      message:"Incorrect email"
                    });  
                  }
                query =req.body.email;
        }
        if (req.user.userRole === 'engineer' && (req.body.email || req.body.email === '')) {
            req.body.email=req.body.email.trim().toLowerCase();
                if (!(validator.isEmail(req.body.email))) {
                    return res.status(400).json({
                    success: false,
                    message:"Please provide a valid email"
                    });
                }
                if (!(req.body.email === req.user.email)) {
                    return res.status(403).json({
                        success: false,
                        message:"Only an admin is allowed to perform this action..!"
                      });
                }
                query =req.body.email;
        }
        //console.log(query);
        // profileName:1,status:1,tags:1,description:1,updatedAt:1,createdAt:1,
        await testCaseModel.find({userName:query},{_id:0,__v:0,configFile:0,intermediateObject:0,filePath:0,userName:0},(err , result) => {
            if (result) {
                if (result.length === 0 ) {
                    return res.status(200).json({
                        success: false,
                        message:"No prifiles found"
                        });
                }
                res.status(200).json({
                    success: true,
                    profilesList:result
                });
            }
        })    
    } catch (error) {
        //console.log(error);
     return res.status(500).json({
        success: false,
        message:"Something went wrong."
      }); 
    }
    
}

//Get File list from configuration path
var data=[];
async function getFiles(req,res)
{
    var allFiles=[];
    try
    {
        const {join}= require('path');
        var userName=req.body.userName;
        const directoryPath = path.join(__dirname, '../configuration_file/'+userName);
        const { readdir, stat } = require('fs')
        const util = require('util');
        require('util.promisify').shim();

        const readdirP = util.promisify(readdir)
        const statP = util.promisify(stat)

        const files = (await readdirP(directoryPath)).map(f => join(directoryPath, f))
        allFiles.push(...files)
        await Promise.all(
            files.map(
                async f => (await statP(f)).isDirectory() && rreaddir(f, allFiles)
            )
        )
        var filesList={};
        await allFiles.forEach(function (file) {
            var {mtime,ctime} = fs.statSync(file);
            var name=file.split(directoryPath+'/')[1];
            var name1 = name.startsWith(".");
            if(!name1)
            {
              filesList['Name']=name.split('.')[0];
              filesList['Status']='';
              filesList['LastModified']=mtime;
              data.push(filesList);
              filesList={};
            }
        });
        var data1=data;
        data=[];
        res.json({ success: true, status: 200, data: data1 ,message: {}});
    }
    catch(e)
    {
        ////Console.log(e);
        res.status(500).send({success:false, message: e});
    }
}

// show the status of particular test case
const getProfileStatus =async (req,res) => {
    try {
        let query =req.user.email;
        let profileName=req.body.profileName+".json";
        await testCaseModel.find({userName:query,profileName:profileName},{status:1,profileName:1,_id:0,ueSimId:1},(err , result) => {
            if (result) {
                if (result.length === 0 ) {
                    return res.status(200).json({
                        success: false,
                        message:"profile not found"
                        });
                }
                res.status(200).json({
                    success: true,
                    result
                });
            }
        }) 
    } catch (error) {
        console.log(error);
     return res.status(500).json({
        success: false,
        message:"Something went wrong."
      }); 
    }
}

// add new ue simulator to database
const addUeSim = async (req,res) => {
    try {
    const totalUeCount=await ueSimModel.countDocuments({});
    //console.log(totalUeCount);
    if (totalUeCount != 0 ) {
        return res.status(500).json({
            success: false,
            message: 'Currently not supported for multi ue' 
          });
    }
    let appManagerPort =8080;
    let ipAddress = req.body.ipAddress;
    if (!ipAddress) {
        return res.status(400).json({
            success: false,
            message:"Please provide IP address"
        }); 
    }
    if (!(validator.isIP(ipAddress))) {
        return res.status(400).json({
        success: false,
        message:"Please provide a valid IP address"
        });
    }
    // ueSimModel.findOne({ipAddress},(err,ueDetails) => {
        
    // })
    const ueDetails=await ueSimModel.findOne({ipAddress});
    if (ueDetails) {
        return res.status(400).json({
            success: false,
            message: 'UE simulator already exists, please provide another UE simulator' 
          });
    }

    ws = new  WebSocket('ws://'+ipAddress+':'+appManagerPort+'/ws', {
        handshakeTimeout: 5000
      });
   // console.log(ws);
    ws.on('open',async function open()
    {
        console.log("node is connected to appManager");
        appManager.connect(ipAddress);
        await ueSimModel.create({
                simId:1,
                ipAddress:ipAddress
            });
        return res.status(200).json({
            success: true,
            message:"UE Simulator added successfully"
            });
    });
    ws.on('close', function close()
    {
        console.log("appManager close the connection with node");
    });
  
    ws.on('error', function error(e)
    {
        console.log("appManager has error while connecting to node");
        //console.log(e.message);
        if (e.message === 'Opening handshake has timed out') {
            return res.status(404).json({
                success: false,
                message:"Could not connect to a UE simulator with this IP address"
                });    
        }
        else if (e.code === 'ECONNREFUSED') {
            return res.status(404).json({
                success: false,
                message:"Could not connect to a UE simulator with this Port number"
                });
        }
        else{
            return res.status(500).json({
                success: false,
                message:"Something went wrong."
                });
        }
    });

    } catch (error) {
        //console.log(error);
     return res.status(500).json({
        success: false,
        message:"Something went wrong."
      }); 
    }
}

// getting all or particular ue simulator details 
const getUeSimsList = async(req,res) => {
   let ue= await ueSimModel.find({},{_id:0,__v:0});
   if (ue.length == 0) {
    return res.status(404).json({
        success: false,
        message:"No ue simulators found"
        });
   }
   res.status(200).json({
    success: true,
    UeSimsList:ue
   })
}

// selecting config file and sending file to app manager for test case execution
async function executeProfile(req, res)
{
  try
  {
     let {simulatorID,profileName} =req.body;
     let baseType;
    var dataBaseProfileName;
    var carrierAggregation;
      if(!simulatorID || !profileName){
        if (!simulatorID) {
          return res.status(400).json({
            success: false,
            message:"Please provide UE simulator Id"
          });  
        }else{
          return res.status(400).json({
            success: false,
            message:"Please provide profile name"
          });
        }
      } 
        //console.log(typeof(req.body.simulatorID));
        if (typeof(req.body.simulatorID) !== 'number') {
            return res.status(400).json({
                success: false,
                message:"Please provide a valid UE simulator Id"
              }); 
        } 
        const ueDetails=await ueSimModel.findOne({simId:simulatorID});
        if (!ueDetails) {
            return res.status(404).json({
                success: false,
                message: 'No UE simulator found with this ID' 
            });
        }

        profileName = profileName+".json";
        var userName = req.user.email;
        
        var pathDir = "../common/.threshold.txt";
        
        const directoryPath = path.join(__dirname, pathDir);
        if (fs.existsSync(directoryPath)) {
            //console.log('Found file');
            fs.readFile(directoryPath, 'utf8', function(err, data){
                // Display the file content
                //console.log(data);
                min_threshold=data
            });
        }
        else
        {
          //console.log('Not Found ');
          min_threshold=20;
        }

        var profileContent=await testCaseModel.find({profileName});
            if (profileContent.length == 0) {
                return res.status(404).json({
                    success: false,
                    message:"Profile not found"
                    });
            }
			profileContent.map( (inter) => {
				dataBaseProfileName = inter.intermediateObject;
				//console.log(Object.keys(profileName)[4]);
				baseType= dataBaseProfileName[Object.keys(dataBaseProfileName)[4]];
                carrierAggregation=dataBaseProfileName[Object.keys(dataBaseProfileName)[5]];
			});
            console.log(baseType);
            console.log(carrierAggregation);
        lteFunctions.startLte(profileName,userName,true,res,req,baseType,carrierAggregation,simulatorID);
	}
  catch (e)
  {
    res.status(500).send({success: true,message: 'Test Could not be started'});
        console.log('startUeSimulator error = ' +e);
	}
  // res.status(200).send({success: true,message: 'Successfully started'});
}

// stop the ue simulator
async function stopProfile(req,res)
{
    
    try
    {
        let {simulatorID,profileName} =req.body;
        if(!simulatorID || !profileName){
            if (!simulatorID) {
            return res.status(400).json({
                success: false,
                message:"Please provide UE simulator Id"
            });  
            }else{
            return res.status(400).json({
                success: false,
                message:"Please provide profile name"
            });
            }
        } 
        if (typeof(req.body.simulatorID) !== 'number') {
            return res.status(400).json({
                success: false,
                message:"Please provide a valid UE simulator Id"
              }); 
        } 
        const ueDetails=await ueSimModel.findOne({simId:simulatorID});
        if (!ueDetails) {
            return res.status(404).json({
                success: false,
                message: 'No UE simulator found with this ID' 
            });
        }
        console.log(ueDetails);
        if (ueDetails.status === 'available') {
            return res.status(400).json({
                success: false,
                message: 'UE simulator is not running any profile' 
            });
        }
        profileName = profileName+".json";
        var profileContent=await testCaseModel.find({profileName});
        if (profileContent.length == 0) {
            return res.status(404).json({
                success: false,
                message:"Profile not found"
                });
        }
       // console.log(profileContent);
    	var result= await lteFunctions.stopLte();
    	if(result)
    	{
        ws.send("STOP_TEST");
        appManager.resetFtpData();
        const updatedProfile = await testCaseModel.findOneAndUpdate({profileName:profileName},{status:"aborted"},{
            fields: {_id:1,status:1,profileName:1},
            new: true 
           });
           console.log(updatedProfile);
        const updatedUeSim = await ueSimModel.findOneAndUpdate({simId:simulatorID},{status:"available",user:null,profileName:null},{	
        new: true 
        });   
        console.log(updatedUeSim);
        //res.status(200).send({success: true,message: 'Successfully stopped'});
        res.status(200).json({
            success: true,
            message:"Test Successfully stopped"
            });
        testRunning=false;
    	}
    	else
    	{
    		res.status(200).send({success: true,message: "No test running"});
            testRunning=false;
    	}
    	//res.status(200).send({success: true,message: 'Successfully stopped'});
    }
    catch (e)
    {
    	////Console.log('stop simulator error : '+e);
    	res.status(500).send({success: true,message: e});
    	//res.status(405).send({success: true,message: 'Test couldnot be stopped'});
    }
    //res.status(200).send({success: true,message: 'Successfully stopped'});
}

//global csv generation
const globalCsvGeneration =async (result, profileName,res) => {
    const userPath='../';
    const directoryPath = path.join(__dirname, userPath);
    let pathData=path.join(directoryPath,profileName);

      var csvFileData = [  
          ['Test Name:', ],
          ['Simnovator Version'],
          ['UE Simulator:',],  
          ['UE Simulator Version',],  
          ['Executed By:',],  
          [],  
          []
      ];

      csvFileData[0].push(profileName.split('.').slice(0, -1).join('.'));
      //csvFileData[1].push("2014 04 02");

      let ue= await ueSimModel.find({},{ipAddress:1,_id:0});
          // if (ue.length == 0) {
          //     return res.status(404).json({
          //         success: false,
          //         message:""
          //         });
          // }
          //console.log(ue[0].ipAddress);
      csvFileData[2].push(ue[0].ipAddress);
      //csvFileData[3].push("2014 04 02");
      csvFileData[4].push( 'user@simnovus.com');

    let header =[];

    header.push("Timestamp");

    for (let j = 0; j < Object.keys(result[0].cells).length; j++) {
      header.push("Cell "+j+": DL Throughput (bps)");
      header.push("Cell "+j+": UL Throughput (bps)");
  }

  for (let j = 0; j < Object.keys(result[0].cells).length; j++) {
      header.push("Cell "+j+": DL Received Pkt Count");
      header.push("Cell "+j+": DL Error Pkt Count");
      header.push("Cell "+j+": UL TX Pkt Count");
      header.push("Cell "+j+": UL Retransmitted Pkt Count");
      header.push("Cell "+j+": DL Retransmitted Pkt Count");
  }

  header.push("UEs: Powered Off State");
  header.push("UEs: Registering State");
  header.push("UEs: Deregistering State");
  header.push("UEs: Configured State");
  header.push("UEs: Registered State");
  header.push("UEs: Deregistered State");

  header.push("UEs: RRC Idle State");
  header.push("UEs: RRC Connected State");
  header.push("UEs: RRC Disconnected State");
  header.push("UEs: RRC Connecting State");

  for (let j = 0; j < Object.keys(result[0].cells).length; j++) {
      header.push("Cell "+j+": Total UE Count");
  }

  for (let j = 0; j < Object.keys(result[0].cells).length; j++) {
      header.push("Cell "+j+": Avg Scheduled UEs DL");
      header.push("Cell "+j+": Avg Scheduled UEs UL");
  }
  csvFileData.push(header);

    for (let i = 0; i < result.length; i++) {
        const element = result[i];
        let temp=[];
         // console.log(element);
              temp.push(element.arrivalDate);

              for (let j = 0; j < Object.keys(element.cells).length; j++) {
                  const cell = element.cells[j];
                  temp.push(cell.throughput.dl_bitrate);
                  temp.push(cell.throughput.ul_bitrate);
              }

              for (let a = 0; a < Object.keys(element.cells).length; a++) {
                  const cell = element.cells[a];
                  temp.push(cell.packets.dl_rx_count);
                  temp.push(cell.packets.dl_err_count);
                  temp.push(cell.packets.ul_tx_count);
                  temp.push(cell.packets.ul_retx_count);
                  temp.push(cell.packets.dl_retx_count);
              }

              for (let k = 0; k < element.nas.length; k++) {
                  temp.push(element.nas[k]);
              }
              for (let l = 0; l < element.rrc.length; l++) {
                  temp.push(element.rrc[l]);
              }  

              for (let m= 0; m < Object.keys(element.cells).length; m++) {
                  const cell = element.cells[m];
                  temp.push(cell.ue_count);
              }

              for (let b= 0; b < Object.keys(element.cells).length; b++) {
                  const cell = element.cells[b];
                  temp.push(cell.schedule.dl_sched_users_avg);
                  temp.push(cell.schedule.ul_sched_users_avg);
              }
             // console.log(temp);
              csvFileData.push(temp);         
    }

      var csv = '';  

      //merge the data with CSV  
      csvFileData.forEach(function(row) {  
              csv += row.join(',');  
              csv += "\n";  
      });
    fs.writeFile(pathData,csv,null,(err)=>{
      if (err)
      {
          res.send({ success: false, status:500, message: err })
      }
      else
      {
        return res.download(pathData, () => {
              fs.unlinkSync(pathData)                  
        });  
      }
  });
}

//Get stats filtered data
async function getGlobalStats(req,res)
{
try
{
if (req.body.responseType === 'json') {
  var end_time = req.body.endTime;
  var start_time = req.body.startTime;
  // var graphType = req.body.start_Time;
  start_time = new Date(start_time);
  end_time = new Date(end_time);
      dataToSend=[];
  console.log("\nStart Time is : "+start_time);
  console.log("\nEnd Time is : "+end_time);
  var time = Math.abs(end_time-start_time);
  time=(time /(1000 * 60 * 60 ));
  console.log("\nTime diffrence is : "+time);
  var layer = await setLayer(time);
  console.log("\nLayer to be retreived is : "+layer);
  await filterSelectedLayerCellData(layer,start_time,end_time,res,sendData);
}else{
    let start =req.body.startTime;
    let end=req.body.endTime;
    let profileName=req.body.profileName+".csv";
  await statsFilter[1].find({"arrivalDate": {$gte:start}},{cells:1,nas:1,rrc:1,_id:0,arrivalDate:1},(err, result) => {
      if (err)
      {
          console.log("Error : "+err);
          res.send({ success: false,  status: 500, message: err });
      }
      else
      {
          //console.log(result.length);
          if (result.length == 0) {
              return res.status(404).json({
                  success: false,
                  message:"No data found with this range"
              });
          } else {
              globalCsvGeneration(result,profileName,res);    
          }
          
      }
  }).catch(e => {
              console.log("Error : "+e);
             res.send({success:false,status:500, message: "Internal error encountered"});
  })
}
// res.send({ success: true, status: 200, message: "Success" });
}
catch (e)
{
console.log(e);
res.status(500).send({success:false, message: "Internal error encountered"});
}
}


// old api *************************************************************************

//Changing the user's status to blocked
function blockUser(req, res) {
    authModel.blockUser(req, res).then((data) => {
        if (data) {
            res.json({ success: true, status: 200, message: 'Block status changed successfully' });
        }
    }).catch((err) => {
        res.json(err);
    });
}

//Start the simulater
// async function startUeSimulator(req, res)
// {
//   try
//   {
//      // console.log("hi");
//      //simid , profile name
//     if(req.body.fileName && req.body.userName)
//     {
//         // console.log("Start ueSimulator");
//         let baseType;
//         var profileName;
//         var carrierAggregation;

//         var fileName = req.body.fileName+".json";
//         var userName = req.body.userName;
//         //console.log(fileName +"   "+userName);
//         // console.log("HI")
//         // if(fs.existsSync("../common/.threshold.txt"))
//         // {
//         //   console.log("Exists");
//         // }
//         var pathDir = "../common/.threshold.txt";
//         // const userPath='../configuration_file/'+userName;
//         const directoryPath = path.join(__dirname, pathDir);
//         if (fs.existsSync(directoryPath)) {
//             //console.log('Found file');
//             fs.readFile(directoryPath, 'utf8', function(err, data){
//                 // Display the file content
//                 //console.log(data);
//                 min_threshold=data
//             });
//         }
//         else
//         {
//           //console.log('Not Found ');
//           min_threshold=20;
//         }

//         var profileContent=await testCaseModel.find({fileName});
// 			profileContent.map( (inter) => {
// 				profileName = inter.intermediateObject;
// 				//console.log(Object.keys(profileName)[4]);
// 				baseType= profileName[Object.keys(profileName)[4]];
//                 carrierAggregation=profileName[Object.keys(profileName)[5]];
// 			});
//             //console.log(baseType);
//             ///console.log(carrierAggregation);
//         lteFunctions.startLte(fileName,userName,true,res,baseType,carrierAggregation);
// 		}
// 	}
//   catch (e)
//   {
//     res.status(500).send({success: true,message: 'Test Could not be started'});
//         console.log('startUeSimulator error = ' +e);
// 	}
//   // res.status(200).send({success: true,message: 'Successfully started'});
// }

//stop the simulator
// async function stopUeSimulator(req,res)
// {
//     ////Console.log("Request Received");
//     try
//     {
//     	var result= await lteFunctions.stopLte();
//     	if(result)
//     	{
//         ws.send("STOP_TEST");
//         appManager.resetFtpData();
//         res.status(200).send({success: true,message: 'Successfully stopped'});
//         testRunning=false;
//     	}
//     	else
//     	{
//     		res.status(200).send({success: true,message: "No test running"});
//             testRunning=false;
//     	}
//     	//res.status(200).send({success: true,message: 'Successfully stopped'});
//     }
//     catch (e)
//     {
//     	////Console.log('stop simulator error : '+e);
//     	res.status(500).send({success: true,message: e});
//     	//res.status(405).send({success: true,message: 'Test couldnot be stopped'});
//     }
//     //res.status(200).send({success: true,message: 'Successfully stopped'});
// }

//send data to Display the editable file
async function editProfile(req,res)
{
  try
  {
    if(res)
    {
      var fileName = req.body.fileName+'.json';
      const {join}= require('path');
      var userName=req.body.userName;
      const filePath = path.join(__dirname, '../configuration_file/'+userName+'/'+fileName);
      if(fs.existsSync(filePath))
      {
        testCaseModel.find({ fileName: fileName}, (err, result) => {
            if (err)
            {
                return res.status(500).send({ success: false, message: "Internal error encountered" });
            }
            console.log("Res : ",result);
            var intermediateObject=result[0]['intermediateObject']
            var JsonData=fs.readFileSync(filePath);
            JsonData=JSON.parse(JsonData);
            console.log("intermediateObject : ",intermediateObject);
            res.status(200).send({success: true, message: 'Successfull', data:JsonData, FileName :req.body.fileName, Username : userName ,intermediateObject:intermediateObject});
        });
      }
      else
      {
        res.status(500).send({success:false, message: 'Profile does not exist'})
      }
    }
  }
  catch(e)
  {
    res.status(500).send({success:false, message: e});
  }
}

// delete profiles from db
async function deleteProfiles(req,res)
{
  try
  {
    let fileList= req.body.fileList;
    const {join}= require('path');
    var userName=req.body.userName;
    for(var i=0;i<fileList.length;i++)
    {
      filePath = path.join(__dirname, '../configuration_file/'+userName+'/'+fileList[i]+".json");
      ////Console.log(filePath);
      file=fileList[i]+".json";
      testCaseModel.deleteMany({ profileName: file }, (err, response) => {
          if (err) {
              res.send(err);
          }
          // console.log('Deleted file :',file);
          // res.send({ status: 200, success: true, message: 'Successfully deleted' });
      })
      fs.unlinkSync(filePath);
    }
    res.status(200).send({success: true, message: 'Profiles deleted successfully', fileList :fileList, Username : userName });
  }
  catch(e)
  {
    res.status(500).send({success:false, message: "Internal error encountered"});
  }
}

//Loading Specific previous logs saved in the database
function loadPreviousLogs(req, res) {
    const body = req.body;
    if (parseInt(body.startTime) > parseInt(body.endTime)) {
        res.send({ success: false, message: 'Start time greater than end time' });
    }
    else {
        try {
            logsModel.find({
                $and: [{
                    "arrivalDate": {
                        $gte: parseInt(body.startTime),
                        $lte: parseInt(body.endTime)
                    }
                }]
            }).lean().exec((err, queryResult) => {
                if (err) {
                    return res.send({ success: false, message: err })
                }
                else {
                    res.send({ success: true, data: queryResult })
                }
            })

        }
        catch (e) {
            res.send({ success: false, message: e })
        }
    }

}

//save logs from mongodb to file
function saveCurrentLogs(req, res) {
    try {
        if (req.session.user) {
            let fileName = req.params.fileName;
            let filePath = `dir/${req.session.user._doc.emailAddress}/${fileName}`;
            let writeStream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8', mode: 0666 })
                .on('error', (e) => {
                    //Console.log(e);
                });

            logsModel.find().cursor().pipe(JSONStream.stringify()).pipe(writeStream).on('close', () => {
                writeStream.end();
                res.send({ success: true, data: 'Logs Saved' })
            });


        }
        else {
            return res.status(500).send({ loggedIn: false, success: false, message: 'Session not found' });
        }

    }
    catch (e) {
        ////Console.log(e);

        return res.status(500).send({ success: false, message: 'Unable to save. Try again later' })
    }
    finally {

    }
}

//Saving all the existing logs to another collection in DB
function saveExistingLogs(req, res) {
    try {
        if (req.body.logsName && req.body.statsName && req.body.uegetName) {
            logsModel.collection.rename(req.body.collectionName, { dropTarget: true }, (err, result) => {
                if (err) {
                    return res.send({ success: false, message: err });
                }
                else {
                    res.send({ success: true, message: "Successfully saved" });
                }
            })
        }
        else {
            res.send({ success: false, message: 'Collection Name not found' });
        }
    }
    catch (e) {

    }
}

//Returning the LTE Socket parameters
function getSocketInfo(req,res){
    try{
        res.send({success:true, data: {
            ipAddress: global.ue_ip,
            portAddress: global.ue_port
        }})
    }
    catch(e){
        res.status(500).send({success: false})
    }
}

//Changing the LTE Socket parameters
function changeSocketInfo(req,res){
    try{
        ////Console.log(req.body);
        if(req.body){
            global.ue_ip = req.body.ipAddress;
            global.ue_port = req.body.port;
        }
        lteSocket.sessionEnd();
        lteSocket.connect();
        res.status(200).send({success:true, message: 'Successfully changed'});
    }
    catch(e){
        // //Console.log(e);

        res.status(500).send({success:false, message: e});
    }

}

// update rx and tx gain
async function updateGain(req,res)
{
  try
  {
    if(res)
    {
      // //Console.log("Rf request received");
       var tx_gain = req.body.tx_gain;
       var rx_gain = req.body.rx_gain;
       var cell_id = req.body.cell_id;
       var channelMap={0:[0,1],1:[2,3],2:[4,5],3:[6,7],4:[8.9],5:[10,11]}
       // //Console.log("Update Ue Simulator");
       // //Console.log("Tx gain : "+tx_gain);
       // //Console.log("Rx gain : "+rx_gain);
       for(var i=0;i<tx_gain.length;i++)
       {
          var result='';
          if((tx_gain.length)==2)
          {
            var channel_index=channelMap[cell_id][i];
            var result=JSON.stringify([{"message" : "rf" , "tx_gain": parseInt(tx_gain[i]),"tx_channel_index": channel_index }]);
          }
          else
          {
            var channel_index=cell_id;
            var result=JSON.stringify([{"message" : "rf" , "tx_gain": parseInt(tx_gain[i]),"tx_channel_index": channel_index }]);
          }
          ////Console.log(result);
          url.send(result);
       }
       for(var i=0;i<rx_gain.length;i++)
       {
         var result='';
         if((rx_gain.length)==2)
         {
           var channel_index=channelMap[cell_id][i];
           result=JSON.stringify([{"message" : "rf" , "rx_gain": parseInt(rx_gain[i]),"rx_channel_index": channel_index }]);
         }
         else
         {
           var channel_index=cell_id;
           result=JSON.stringify([{"message" : "rf" , "rx_gain": parseInt(rx_gain[i]),"rx_channel_index": channel_index }]);
         }
         ////Console.log(result);
         url.send(result);
       }
     }
     res.status(200).send({success: true,message: 'Successfully updated'});
  }
  catch(e)
  {
    res.status(500).send({success:false, message: e})
  }
}

//Get ue stats filtered data
async function getUeStatsForRange(req,res)
{
  try
  {
    var endTime = req.body.end_Time;
    var startTime = req.body.start_Time;
    dataToSend=[];
    startTime = new Date(startTime);
    endTime = new Date(endTime);
    console.log("\nStart Time is : "+startTime);
    console.log("\nEnd Time is : "+endTime);
    var time = Math.abs(endTime-startTime);
    time=(time /(1000 * 60 * 60));
    console.log("\nTime diffrence is : "+time);
    var layer = await setLayer(time);
    console.log("\nLayer to be retreived is : "+layer);
    await filterSelectedLayerUeData(layer,startTime,endTime,res,sendData);
  }
  catch (e)
  {
    console.log(e);
    res.status(500).send({success:false, message: "Internal error encountered"});
  }
}

// getting start time of global,ue and messageCounter
async function getstatsStartTime(req,res)
{
    try
    {
      var requestType=req.body.Request_Type;
      if(requestType=="Global")
      {
        await statsFilter[1].findOne().sort({"arrivalDate": 'asc'}).exec(function(err, result){
            if (err)
            {
              console.log("Error : "+err);
              res.send({ success: false,  status: 400, message: err });
            }
            else
            {
              // var start_Time=JSON.parse(result);
              // var start_Time=JSON.parse(result)
              console.log("Result of query : ",result['arrivalDate']);
              var start_Time=result['arrivalDate']
              res.send({ success: true, status: 200, startTime:start_Time});
            }
          });
      }
      else if (requestType=="messagecounter") {
         await messageModel.findOne().sort({"arrivalDate":'asc'}).exec( (err, result) => {
            if (err)
            {
              console.log("Error : "+err);
              res.send({ success: false,  status: 500, message: err });
            }
            else
            { 
                console.log("Result of query : ",result['arrivalDate']);
                var start_Time=result['arrivalDate']
                res.send({ success: true, status: 200, startTime:start_Time});
            }
          })
      }
      else
      {
        await ueFilter[1].findOne().sort({"arrivalDate": 'asc'}).exec(function(err, result){
            if (err)
            {
              console.log("Error : "+err);
              res.send({ success: false,  status: 500, message: err });
            }
            else
            {
              // var start_Time=JSON.parse(result);
              // var start_Time=JSON.parse(result)
              console.log("Result of query : ",result['arrivalDate']);
              var start_Time=result['arrivalDate']
              res.send({ success: true, status: 200, startTime:start_Time});
            }
          });
      }
    }
    catch (e)
    {
      console.log("Error catch : "+e);
      res.send({ success: false, status: 400, data:"Internal Server Error"});
    }
}

const getMessageCounterData = async(req,res) => {
    let time1 =req.body.startTime;
    let time2 =req.body.endTime;
    messageModel.find({"arrivalDate": {$gte:time1,$lte:time2}},{messages:1,_id:0}, async(err, result) => {
        let dataToSend=[];
        for (let i = 0; i < result.length; i++) {
            let s= Object.values(result[i])
            dataToSend.push(s[0]);
        }
        //console.log(dataToSend);
        res.status(200).send({data:dataToSend,length:dataToSend.length})
    }).lean();
}

//Get all the card details from ue
function getRfCardData(req,res)
{
    try
    {
        var hundredMhz=false;
        var fs = require('fs');
        const filePath = path.join(__dirname, '../.sdr_check_result.txt')
        var fileData = fs.readFileSync(filePath,'utf8');
        Data=fileData.replace(/(\r\n|\n|\r|\t|\[|\])/gm, "");
        var array=[]
        let cardData=[]
        array = Data.split('}');
        array.pop("");
        for(var i=0;i<array.length;i++)
        {
            var strData=array[i];
            if(i>0)
            {
                strData=strData.substr(1);
            }
            var parsedData=JSON.parse(strData+"}");
            if (parsedData.boardID=== "0x4b21(SDR100)") {
                hundredMhz=true;
            }

            cardData.push(parsedData);
        }
        res.json({ success: true, status: 200, data: cardData ,hundredMhz:hundredMhz});
    }
    catch(e)
    {
        console.log(e);
        res.status(500).send({success: false})
    }

}

//update card details from ue
const updatedRfCardData =async (req,res) => {
    if (!testRunning) {
       await system('./getRfCardData.sh '+ueConnection.ue_ip+' '+ueConnection.ue_UserName+' '+ueConnection.ue_Password)
        .then((value)=> {
            var hundredMhz=false;
            var fs = require('fs');
            const filePath = path.join(__dirname, '../.sdr_check_result.txt')
            var fileData = fs.readFileSync(filePath,'utf8');
            Data=fileData.replace(/(\r\n|\n|\r|\t|\[|\])/gm, "");
            var array=[]
            let cardData=[]
            array = Data.split('}');
            array.pop("");
            for(var i=0;i<array.length;i++)
            {
                var strData=array[i];
                if(i>0)
                {
                    strData=strData.substr(1);
                }
                var parsedData=JSON.parse(strData+"}");
                if (parsedData.boardID=== "0x4b21(SDR100)") {
                    hundredMhz=true;
                }

                cardData.push(parsedData);
            }
       return res.json({ success: true, status: 200, data: cardData ,hundredMhz:hundredMhz});
       })
        .catch( (error) => {
           console.log(error);
           return res.status(500).json({message:'something went wrong'});
        });

    } else {
       return res.status(503).json({success: false,message:'wait 5 seconds and then try again'});
    }
}

//Gathering system information like CPU, RAM, Hard Disk Information
function getSystemInfo(req, res) {
    dataCollection.returnSystemInfo().then((value) => {
        res.status(200).json(value)
    })
        .catch(e => {
            res.status(500).send({ success: false, message: e.split('\n') })
        });
}

//Getting previous Statistics
function getPreviousStats(req, res) {
    if (req.body.range) {
        try {
            let range = req.body.range;
            statsModel.countDocuments().exec((countErr, countRes) => {
                if (countErr) {
                    res.status(500).send({ success: false, message: countErr })
                }
                if (range != -1) {
                    if (countRes > range) {
                        statsModel.find().sort({ _id: -1 }).limit(range).lean().exec((limitErr, limitEl) => {
                            if (limitErr) {
                                res.status(500).json({ success: false, message: limitErr })
                            }
                            res.status(200).send({ success: true, totalCount: range, data: JSON.stringify(limitEl) })
                        })
                    }
                    else {
                        statsModel.find().sort({ _id: 1 }).lean().exec((totalErr, totalRes) => {
                            if (totalErr) {
                                res.status(500).send({ success: false, message: totalErr })
                            }
                            res.status(200).send({ success: true, totalCount: countRes, data: JSON.stringify(totalRes) })
                        })
                    }
                }
                else {
                    statsModel.find().sort({ _id: 1 }).lean().exec((err, res) => {
                        if (err) {
                            res.status(500).send({ success: false, message: e });
                        }
                        else {
                            res.status(200).send({ success: true, totalCount: countRes, data: JSON.stringify(res) })
                        }
                    })
                }
            })
        }
        catch (e) {
            res.status(500).send({ success: false, message: e })
        }
    }
    else {
        res.status(500).send({ success: false, message: 'Range not provided' })
    }
}

//Getting a data range between which the statistics have been saved
function getDataRange(req, res) {
    try {
        statsModel.countDocuments().exec((countErr, countRes) => {
            if (countErr) {
                return res.status(500).send({ success: false, message: countErr })
            }

            res.status(200).send({ success: true, count: countRes })
        })

    }
    catch (e) {
        res.status(500).send({ success: false, message: e })
    }
}

//Getting all the saved Statistics from the DB
function getAnyStats(req, res) {
    try {
        ////Console.log(req.body.reqParam);

        let reqParams = {};
        if (req.body.reqParam) {
            reqParams[req.body.reqParam] = 1;
        }
        ////Console.log(reqParams);

        statsModel.find({}, reqParams).populate({ path: 'counters.messages', select: 'messages.prach' }).lean().limit(200).exec((err, message) => {
            res.status(200).send({ data: message, success: true });
        })
    }
    catch (e) {
        res.status(400).send(e);
    }
}

////************************************routes logic ends************************************************************* */

//Running the new generated Configuration File

//Getting a list of all the users present
// function getUsers(req, res) {
//     authModel.getUsers(req.body).then((data) => {
//         if (data) {
//             res.json({ success: true, status: 200, data: data, message: {} });
//         }
//     }).catch((err) => {
//         res.json(err);
//     });
// }



//Editing the user's details
// function editUser(req, res) {
//     authModel.editUser(req, res).then((data) => {
//         if (data) {
//             res.json({ success: true, status: 200, message: 'Block status changed successfully' });
//         }
//     }).catch((err) => {
//         res.json(err);
//     });
// }

//Deleting users from the database
// function deleteUsers(req, res) {
//     authModel.deleteUser(req, res).then((data) => {
//         if (data) {
//             res.json({ success: true, status: 200, message: 'User deleted successfully' });
//         }
//     }).catch((err) => {
//         res.json(err);
//     });
// }
module.exports.init = init;