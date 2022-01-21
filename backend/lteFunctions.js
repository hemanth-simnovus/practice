const fs = require('fs');

const ueCon= require('./connections/socket_parameters.js');
const logsModel = require('./models/logs-model');
const messageModel = require('./models/message_model');
const statsModel = require('./models/stats_model');
const statsFilter = require('./models/statsmodel');
const ueFilter = require('./models/ueModel');
const ueModel = require('./models/ue_get_model');
const testCaseModel= require('./models/testCaseModel');
const ueSimModel = require('./models/ueSimModel');

var DurationDict={};
var imsiG=null;
var index=0;
var eindex=0;
var urlG;
var volteData=[];
var endTimeData=[];
var powerOffTimeData=[];
var timeouts=[];
var threshold=1;
var testStatus=false;

global.testRunning=false;

var ue_ip = ueCon.ue_ip;
var ue_port = ueCon.ue_port;
var ue_Username = ueCon.ue_UserName;
var ue_Password = ueCon.ue_Password;
var ue_tcp_port=ueCon.ue_tcp_port;
var client;
let opt = { extraHeaders: { "origin": "Test" } };


/////////////////////////////////////////////////////////////////////////////////////

//Create a tcp Connection with the Sip client
async function startTcp()
{
	var net = require('net');
	var HOST = ue_ip;
	var PORT = ue_tcp_port;
	client=undefined;
	client = new net.Socket();
	client.connect(PORT, HOST, function() {
  	  	//console.log('TCP Client connected to: ' + HOST + ':' + PORT);
	});

	client.on('data',(data)=>
	{
    		//console.log("Sip data is : "+data);
	});

	client.on('error', function (e) {
    		//console.log("Chethan: sip tcp error : "+e);
    		return;
	});

	client.on('close',function(error){
  		//console.log('Socket closed!');
  		if(error)
  		{
    			//console.log('Socket was closed : '+error);
  		}
	});
}
/////////////////////////////////////////////////////////////////////////////////////

/**

* Executes the command passed to it as an argument. It is used to start and stop any process.

* @param {string} cmd - A string containing the command to run, with space-separated arguments.

* @returns {Promise} Promise object

*/
function executeCmd(cmd)
{
    try
    {
    	const exec = require('child_process').exec;
    	return new Promise((resolve, reject) => {
     	exec(cmd, (error, stdout, stderr) => {
      	if (error)
      	{
       		//console.warn(error);
      	}
      	resolve(stdout? stdout : stderr);
     	});
    	});
    }
    catch(e)
    {
			//console.log(e);
    }
}

// Get the required data from the json file created
function getUeFileData(fileName,userName,JsonData)
{
    try
    {
        //var JsonData=require("./configuration_file/"+userName+"/"+fileName);
        var ueList= JsonData['ue_list'];
        for(var i=0;i<ueList.length;i++)
        {
            simEvents=ueList[i]['sim_events'];
            var ueId=ueList[i]['ue_id'];
            var volteStartTime;
            var volteEndTime;
            for(var j=0;j<simEvents.length;j++)
            {
                if(simEvents[j]['event']=='pdn_connect' && simEvents[j]['apn']=='ims')
                {
                    var ueDataValue={};
                    ueDataValue['ue_id']=ueId;
                    ueDataValue['start_time']=simEvents[j]['start_time']+5;
                    volteStartTime=simEvents[j]['start_time'];
                    volteData.push(ueDataValue);
                }
                else if(simEvents[j]['event']=='pdn_disconnect' && simEvents[j]['apn']=='ims')
                {
                    var endTimeValue={};
                    volteEndTime=simEvents[j]['start_time'];
                    endTimeValue['ue_id']=ueId;
                    endTimeValue['end_time']=volteEndTime+10;
                    //console.log("End Time : "+endTimeValue['end_time']);
                    //console.log("End time Value : "+volteEndTime);
                    endTimeData.push(endTimeValue);
                }
                else if(simEvents[j]['event']=="power_on")
                {
                    continue;
                }
								else if(simEvents[j]['event']=="power_off")
								{
									var powerOffTime = {};
									powerOffTime['ue_id']=ueId;
						      powerOffTime['end_time']=simEvents[j]['start_time']+5;
									powerOffTimeData.push(powerOffTime);
								}
						    else
						    {
						        //Handle Tcp and Udp required Data
						    }
            }
            DurationDict[ueId]=(volteEndTime-volteStartTime)-2;
        }
				powerOffTimeData.sort((a, b) => (a.end_time > b.end_time) ? 1 : -1);
				setPowerOffTimer();
        if(volteData.length==0)
        {
            //console.log("File data Type : Udp/Tcp");
            return
        }
        endTimeData.sort((a, b) => (a.end_time > b.end_time) ? 1 : -1);
        volteData.sort((a, b) => (a.start_time > b.start_time) ? 1 : -1)
        if(volteData.length%2!=0)
        {
            volteData.pop(volteData.length);
        }
				//console.log("File is tcp");
       	setUeEndTimer();
       	//getUeData(); //urlG);
    }
    catch(e)
    {
        //console.log(e);
    }
}


//Clear all the timers created with respect to the test

function clearTimeouts()
{
	try
	{
		for (var i=0;i<timeouts.length;i++)
  	{
          	clearTimeout(timeouts[i]);
  	}
	}
	catch(e)
	{
		//console.log("Clear Timeout : "+e);
	}
	return
}

//Clear all the data with respect to the test

function clearData()
{
	try
	{
		sTime=0;
  	index=0;
  	eindex=0;
		powerOffTimeData=[];
		endTimeData=[];
  	volteData=[];
  	testStatus=false;
		return
	}
	catch(e)
	{
		//console.log("Clear Data : "+e);
	}
}

//Timer to clear all the data and destroy any socket connection with the client.

function setPowerOffTimer()
{
	var powerOffTimeLen = powerOffTimeData.length;
	var pTimeObj = powerOffTimeData[powerOffTimeLen-1];
	try
  {
		timeouts.push(setTimeout(function(resolve)
  	{
		  //console.log("Power Off timer activated at : "+pTimeObj['end_time']);
	    clearTimeouts();
	    clearData();
      io.emit('test_Complete', JSON.stringify({ 'status': 200, 'closed': false }));
	    //console.log("Test Completed");
		},pTimeObj['end_time']*1000));
	}
	catch(e)
	{
		//console.log(e);
	}
}

//start a end timer to notify the front end on completion of the test and pull the log files from sip client
const exec = require('child_process').exec;
function setUeEndTimer()
{
    var endTimeLen = endTimeData.length;
    var eTime = endTimeData[endTimeLen-1];
    var endTimeUeId = eTime['ueId'];
    try
    {
      timeouts.push(setTimeout(function(resolve)
      {
				testStatus=false;
        },eTime['end_time']*1000));
    }
    catch (e)
    {
      //console.log("Timeout Error : "+e)
    }
}


//start a timer and request for the ue status from ue machine
var sTime=0
function getUeData()
{
	try
	{
    		for(; index < (volteData.length) && ((volteData[index]['start_time'] - sTime) < threshold); index++)
    		{
        		urlG.send(JSON.stringify([{ "message": 'ue_get',"ue_id":volteData[index]['ue_id']}]));
    		}
    		if(index < (volteData.length))
    		{
	      		sTime = volteData[index]['start_time'];
	      		timeouts.push(setTimeout(function(){getUeData(urlG)},(volteData[index]['start_time']*1000)));
    		}
    		else
    		{
			clearData();
    		}
	}
	catch(e)
	{
		//console.log(e)
	}
}


//Stop the test on a request from front end
async function stopLte()
{
    try
    {
        //var cmd = './stop_lteue.sh '+ue_ip +' '+ue_Username+' '+ue_Password ;
        //let stopTest = await executeCmd(cmd);
        await clearTimeouts();
        await clearData();
        return true;
    }
    catch(e)
    {
        //console.log("Error trying to stop test : "+e);
				return false;
    }
}

//Link the conf file to the ue machine and restart service.
//Also create a wesocket connection to the ue machine for status of the registration request.
//If the Response on the websocket has uelist and pdnlist then request for volte start.
async function startLte(fileName, user, flag,res,req,baseType,carrierAggregation,simulatorID)
{
    try
    {
			testStatus=true;

			//var JsonData=require("./configuration_file/"+userName+"/"+fileName);

			var date=new Date();
			var epoch=Date.parse(date);
			// console.log(date);
			for(var i=1;i<6;i++)
			{
				statsFilter[i].deleteMany({arrivalDate:{$lt:epoch}},(err,result) =>{
					if(err)
					{
						console.log(err);
					}
				})
			}
			for(var j=1;j<6;j++)
			{
				ueFilter[j].deleteMany({arrivalDate:{$lt:epoch}},(err,result) =>{
					if(err)
					{
						console.log(err);
					}
				})
			}
			logsModel.deleteMany({arrivalDate:{$lt:epoch}},(err,result) =>{
				if(err)
				{
					console.log(err)
				}
			})
			statsModel.deleteMany({arrivalDate:{$lt:date}},(err,result) =>{
				if(err)
				{
					console.log(err)
				}
			})
			messageModel.deleteMany({arrivalDate:{$lt:epoch}},(err,result) =>{
				if(err)
				{
					console.log(err)
				}
			})
			ueModel.deleteMany({arrivalDate:{$lt:date}},(err,result) =>{
				if(err)
				{
					console.log(err)
				}
			})

			var jsonPath = "./configuration_file/"+userName+"/"+fileName ;
			var jsonConfig = JSON.parse(fs.readFileSync(jsonPath , 'utf8'));
			//console.log(JSON.stringify({"file_name":fileName,"config":jsonConfig}));

			ws.send(JSON.stringify({"file_name":fileName,"config":jsonConfig}));
			testRunning=true;
			const updatedProfile = await testCaseModel.findOneAndUpdate({user,testCaseName:fileName},{status:"running"},{
				fields: {_id:1,status:1,testCaseName:1},
				new: true 
			   });
			//    console.log(updatedProfile._id);
			// const updatedUeSim = await ueSimModel.findOneAndUpdate({simId:simulatorID},{status:"running",user:req.user.email,profileName:updatedProfile.profileName},{	
			// new: true 
			// });   
			   //res.status(200).send({success: true,message: 'Successfully started',bsType:baseType,carrierAggregation:carrierAggregation});
			   let executionHistoryObj = {
				time: new Date().getTime(),
				result: "success",
				duration: 0,
			  };
			  let editHistoryObj = {
				  time: new Date().getTime(),
				  comments :" "
			  };
			  await testCaseModel.findOne({
				user,
				testCaseName: fileName,
			  }, async (err, doc) => {
				  if (doc) {
					  doc.executionHistory.push(executionHistoryObj);
					  doc.editHistory.push(editHistoryObj);
					 await doc.save()
				  }
			  });

			   res.status(200).json({
					success: true,
					message:"Test Successfully started"
					});
			   getUeFileData(fileName,user,jsonConfig);
    }
    catch(e)
    {
			res.status(500).send({success: false,message: 'Test could not be started'});
      console.log("Start Lte error : "+e);
    }
}


//Receive volte start request and send the request to the sip client to start the volte on the tcp client
function startVolte(msg)
{
    if('pdn_list' in msg)
    {
        var pdn_list=msg["pdn_list"];
        let re = new RegExp('ims*');
        var i;
        for(i=0; i<pdn_list.length && !re.test(pdn_list[i]['apn']); i++){;}
        if(i < pdn_list.length)
        {
    	    let ip = pdn_list[i]['ipv4'];
       	  let name = pdn_list[i]["apn"];
    	    let ueid = msg["ue_id"];
    	    let imsi = msg["imsi"];
    	    let duration = DurationDict[ueid];
    	    if(imsiG == null)
    	    {
              imsiG = imsi;
              client.write(""+imsi+" "+ ueid+" "+name+" "+ip+" "+ duration);
	      //console.log(""+imsi+" "+ ueid+" "+name+" "+ip+" "+ duration);
    	    }
    	    else
    	    {
              client.write(""+imsi+" "+ ueid+" "+name+" "+ip+" "+ duration+" "+imsiG);
       	      //console.log(""+imsi+" "+ ueid+" "+name+" "+ip+" "+ duration+" "+imsiG);
              imsiG = null;
    	    }
        }
    }else
{}
}

module.exports=
{
    startLte,
    stopLte
}
