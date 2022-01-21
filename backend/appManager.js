//const WebSocket = require('ws');
var ltefunctions=require('./lteFunctions.js');
const lte_socket = require('./lte_socket');

global.volteFlag=0;
global.ftpData={};
global.volteMessages={};
global.ftpFlag=0;
global.volteData=[];
global.volteCounter={};
global.volteMos={};
// global.ws;
var intervalFlag=false;
var setFtpInterval;
var closedFlagCount=0;
var closedFlag=true;
var ueIp; 

function resetFtpData()
{
  // console.log("clearInterval");
  if(intervalFlag)
  {
      clearInterval(setFtpInterval);
      intervalFlag=false;
  }
}

// function executeCmd(cmd)
// {
//     try
//     {
//     	const exec = require('child_process').exec;
//     	return new Promise((resolve, reject) => {
//      	exec(cmd, (error, stdout, stderr) => {
//       	if (error)
//       	{
//        		//Console.warn(error);
//       	}
//       	resolve(stdout? stdout : stderr);
//      	});
//     	});
//     }
//     catch(e)
//     {
// 			//Console.log(e);
//     }
// }

// async function startAppManager()
// {
//   var cmd = './startAppManager.sh '+appManager_ip +' '+appManager_UserName+' '+appManager_Password ;
//   closedFlagCount=0;
//   //Console.log("Tried starting the AppManager\n\n")
//   let startAppManager = await executeCmd(cmd);
// }

// setInterval(() => {
//   if (closedFlagCount<6 && closedFlag==true) {
//     //Console.log('AppManager Closed socket and reconnecting');
//     connect();
//   }
//   if(closedFlagCount>=6)
//   {
// 	   startAppManager();
//      connect();
//   }
// },2000);



let connect = function(ipAddress)
{
 // ws = new  WebSocket('ws://'+appManager_ip+':'+appManager_port+'/ws');
  // ws.on('open', function open()
  // {
  //   console.log("node is connected to appManager");
  //   closedFlag = false;
  // });
  // ws.on('close', function close()
  // {
  //   if(closedFlag==false)
  //   {
	//      closedFlagCount=0;
  //   }
  //   closedFlag=true;
  //   closedFlagCount = closedFlagCount+1;
  // });

  // ws.on('error', function error(e)
  // {
  //   if(closedFlag==false)
  //   {
  //       closedFlagCount=0;
  //   }
  //   closedFlag=true;
  //   closedFlagCount = closedFlagCount+1;
  // });
 ueIp=ipAddress;
//  console.log("comming");
  ws.on('message', (data) => {
    data=JSON.parse(data);
    // console.log(data);
    console.log("data is comming from appManager");
    switch(data["message"]['layer'])
    {
      case "SIP":
                  switch(data["messagetype"])
                  {
                    case "LOG":
                              volteCounter[data["messagename"]]=data["messagecounter"];
                              io.emit('volte_messagecounter', volteCounter);
                              volteMessages=volteCounter;
                              volteData.push(data["message"]);
                              volteFlag=1;
                              break;
                    case "STATS":
                              volteMos[data['message']['ue_id']]={};
                              volteMos[data['message']['ue_id']]["Rx"]=data['message']['data'][0]["Rx"]["MOS"];
                              volteMos[data['message']['ue_id']]["Tx"]=data['message']['data'][0]["Tx"]["MOS"];
                              io.emit('volte_stats', volteMos);
                              break;
                    case "GLOBAL_STAT":
                              volteMos={};
                              volteCounter={};
                              volteFlag=0;
                              break;
                    default :
                              break;
                  }
                  break;
      case "FTP":
             switch(data["messagetype"])
             {
               case "STATS":
                   ftpData=data["message"];
                   console.log("Stats Emit");
                   io.emit('ftp_stats', data["message"]);
                   ftpFlag=1;
                   break;
               case "GLOBAL_STAT":
                   setFtpInterval = setInterval(function(){
                      let time= new Date().getTime();
                      intervalVar=true;
                      var len=Object.keys(ftpData['data']).length;
                      for(var i=1;i<=len;i++)
                      {
                        ftpData['data'][i]['Avg speed']=0;
                      }
                      ftpData['timestamp']=time;
                      io.emit('ftp_stats', ftpData);
                    },1000)
                    break;
              default :
                      break;

            }
            break;
      case "APP":
        // console.log(data);
        console.log("***********appManager notification*************");
        console.log(data['message']["data"]);
        console.log(data['message']);
        console.log("*********notification ends*****************");
        if(data["messagetype"]=="error")
        {
          // console.log("App Error",data["message"])
          io.emit('appManager_error', data['message']);
        }
        switch(data['message']["data"])
        {
          case "LTE_SUCCESS":
                              lte_socket.connect(ueIp);

                        break;
          case "LTE_FAILED":
          case "STOP_FAILED":
          case "STOP_SUCCESS":
                            
                io.emit('notification_App_Manager', data['message']);
                break;

          default:
                break;
        }
        break;
      case "PING":
          console.log(data['message']);
          io.emit('ping', data['message']);
        break;  
       default :
              break;
      }
  
    });
}



module.exports = {
  connect,
  resetFtpData,
}

exports.connect = connect;
exports.resetFtpData = resetFtpData;
