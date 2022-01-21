const statsFilter = require('./models/statsmodel')

var maxLayer=6 ;   /*Set max layer value to 5 as we have 5 layered structure*/
var tempArray={};
var count=0;

var nasArray=[0,0,0,0,0,0];
var rrcArray=[0,0,0,0];

/*function called to insert data into the database*/
function push_to_db_cellwise(layer,statsData)
{
 //console.log("Request received to push data to layer : ",layer);
 if(layer==1)
 {
   count=count+1;
   //console.log("Count : ",count)

    statsData["nas"]=nasArray;
    statsData["rrc"]=rrcArray;
 }else{
  statsData.nas = undefined;
  statsData.rrc = undefined;
 }
 
 const query = Object.entries(statsData).reduce((a, [k, v]) => {
  if (v !== undefined) {
    a[k] = v;
  }
  return a
}, {});

 //console.log(query);
statsFilter[layer].create(query, (err, res) => {
 		if (err)
       return false;
       //res.status(500).send({success:false, message:err});
     return true;
 })
}

async function processStatsData(statsData)
{
 var result={};
 var statsLen=0;
 var count = 0;
 var len=Object.keys(statsData).length;
 if(statsData!={} && len>0)
 {
   statsLen=len;
   for(key in statsData)
   {
     count=count+1;
     if(key!= "rf" && key != "extraDate" && key!="counters" && key!="cells")
     {
       result[key]=statsData[key];
     }
     if(key=="cells")
     {
       result[key]={};
       var cellLen=Object.keys(statsData[key]).length;
       for(var i=0;i<cellLen;i++)
       {
         result[key][i]={};
         result[key][i]['throughput']={};
         result[key][i]['schedule']={};
         result[key][i]['packets']={};
         result[key][i]['ue_count']={};
         result[key][i]['ue_count']=statsData[key][i]['ue_count'];
         result[key][i]['throughput']['dl_bitrate']=statsData[key][i]['dl_bitrate'];
         result[key][i]['throughput']['ul_bitrate']=statsData[key][i]['ul_bitrate'];
         if(statsData[key][i]['dl_sched_users_avg']!=undefined)
         {
           result[key][i]['schedule']['dl_sched_users_avg']=statsData[key][i]['dl_sched_users_avg'];
         }
         if(statsData[key][i]['ul_sched_users_avg']!=undefined)
         {
           result[key][i]['schedule']['ul_sched_users_avg']=statsData[key][i]['ul_sched_users_avg'];
         }
         result[key][i]['packets']['dl_rx_count']=statsData[key][i]['dl_rx_count'];
         result[key][i]['packets']['dl_err_count']=statsData[key][i]['dl_err_count'];
         result[key][i]['packets']['ul_tx_count']=statsData[key][i]['ul_tx_count'];
         result[key][i]['packets']['ul_retx_count']=statsData[key][i]['ul_retx_count'];
         result[key][i]['packets']['dl_retx_count']=statsData[key][i]['dl_retx_count'];
       }
     }
     if(count===statsLen)
     {
       // //console.log(result)
       return result;
     }
   }
 }
}

/*function called when data is received*/
async function handle_statsData(layer,statsData)
{
 var statsFilteredData={}
 if(layer==1)
 {
   statsFilteredData = await processStatsData(statsData);
 }
 else
 {
   statsFilteredData = statsData;
 }
 // //console.log("Processed Data is  : ",statsFilteredData["cells"]);
 push_to_db_cellwise(layer,statsFilteredData);
 layer=layer+1;
 if (layer < maxLayer )
 {
     if(tempArray[layer]==undefined)
     {
       tempArray[layer]=[];
     }
     if(tempArray[layer].length==2) /*Layer threshold check*/
     {
       tempArray[layer].push(statsFilteredData);
       // //console.log(tempArray[layer]);=
       // var result={};
       var count=0;
       var resultData={}
       var cellCount=0;
       for(var i=0;i<tempArray[layer].length;i++)
       {
         if(cellCount==0)
         {
           // //console.log(tempArray[layer][i]);
           for(key in tempArray[layer][i])
           {
             resultData[key]={};
             // //console.log(key)
             if(key=='cells')
             {
               for(key1 in tempArray[layer][i][key])
               {
                 resultData[key][key1]={};
                 resultData[key][key1]={};
                 resultData[key][key1]={};
                 resultData[key][key1]['throughput']={};
                 resultData[key][key1]['schedule']={};
                 resultData[key][key1]['packets']={};
                 resultData[key][key1]['throughput']['dl_bitrate']=0;
                 resultData[key][key1]['throughput']['ul_bitrate']=0;
                 resultData[key][key1]['schedule']['dl_sched_users_avg']=0;
                 resultData[key][key1]['schedule']['ul_sched_users_avg']=0;
                 resultData[key][key1]['packets']['dl_rx_count']=0;
                 resultData[key][key1]['packets']['dl_err_count']=0;
                 resultData[key][key1]['packets']['ul_tx_count']=0;
                 resultData[key][key1]['packets']['ul_retx_count']=0;
                 resultData[key][key1]['packets']['dl_retx_count']=0;
               }
               cellCount=1;
             }
           }
         }
       }
       for(var i=0;i<tempArray[layer].length;i++)
       {
         count=count+1;
         // //console.log(i);
         // //console.log(tempArray[layer][i]['cells']);
         for(key in tempArray[layer][i])
         {
           if(key=='cells')
           {
             // //console.log(tempArray[layer][i][key]);
             for(key1 in tempArray[layer][i][key])
             {
               //console.log("\n\n");
               // //console.log(resultData[key][key1]['throughput']['dl_bitrate']);
               // //console.log(tempArray[layer][i][key][key1]['throughput']['dl_bitrate']);
               resultData[key][key1]['throughput']['dl_bitrate']=resultData[key][key1]['throughput']['dl_bitrate']+tempArray[layer][i][key][key1]['throughput']['dl_bitrate'];
               // //console.log(resultData[key][key1]['throughput']['dl_bitrate']);
               resultData[key][key1]['throughput']['ul_bitrate']=resultData[key][key1]['throughput']['ul_bitrate']+tempArray[layer][i][key][key1]['throughput']['ul_bitrate'];
               resultData[key][key1]['schedule']['dl_sched_users_avg']=resultData[key][key1]['schedule']['dl_sched_users_avg']+tempArray[layer][i][key][key1]['schedule']['dl_sched_users_avg'];
               resultData[key][key1]['schedule']['ul_sched_users_avg']=resultData[key][key1]['schedule']['ul_sched_users_avg']+tempArray[layer][i][key][key1]['schedule']['ul_sched_users_avg'];
               resultData[key][key1]['packets']['dl_rx_count']=  resultData[key][key1]['packets']['dl_rx_count']+tempArray[layer][i][key][key1]['packets']['dl_rx_count'];
               resultData[key][key1]['packets']['dl_err_count']=resultData[key][key1]['packets']['dl_err_count']+tempArray[layer][i][key][key1]['packets']['dl_err_count'];
               resultData[key][key1]['packets']['ul_tx_count']=resultData[key][key1]['packets']['ul_tx_count']+tempArray[layer][i][key][key1]['packets']['ul_tx_count'];
               resultData[key][key1]['packets']['ul_retx_count']=resultData[key][key1]['packets']['ul_retx_count']+tempArray[layer][i][key][key1]['packets']['ul_retx_count'];
               resultData[key][key1]['packets']['dl_retx_count']=resultData[key][key1]['packets']['dl_retx_count']+tempArray[layer][i][key][key1]['packets']['dl_retx_count'];
             }
             // cellCount=1;
           }
           else
           {
             resultData[key]=tempArray[layer][i][key];
           }
         }
         if(count==tempArray[layer].length)
         {
           // cellCount=0;
           count=0;
           for(key in resultData)
           {
             if(key=="cells")
             {
               for(key1 in resultData[key])
               {
                 //console.log("\n\n")
                 //console.log("Layer is : ",layer);
                 // //console.log(resultData[key][key1]['throughput']['dl_bitrate'])
                 resultData[key][key1]['throughput']['dl_bitrate']=(resultData[key][key1]['throughput']['dl_bitrate'])/3;
                 // //console.log("Throughput : ",resultData[key][key1]['throughput']['dl_bitrate'])
                 resultData[key][key1]['throughput']['ul_bitrate']=(resultData[key][key1]['throughput']['ul_bitrate'])/3;
                 resultData[key][key1]['schedule']['dl_sched_users_avg']=(resultData[key][key1]['schedule']['dl_sched_users_avg'])/3;
                 resultData[key][key1]['schedule']['ul_sched_users_avg']=(resultData[key][key1]['schedule']['ul_sched_users_avg'])/3;
                 resultData[key][key1]['packets']['dl_rx_count']= (resultData[key][key1]['packets']['dl_rx_count'])/3;
                 resultData[key][key1]['packets']['dl_err_count']=(resultData[key][key1]['packets']['dl_err_count'])/3;
                 resultData[key][key1]['packets']['ul_tx_count']=(resultData[key][key1]['packets']['ul_tx_count'])/3;
                 resultData[key][key1]['packets']['ul_retx_count']=(resultData[key][key1]['packets']['ul_retx_count'])/3;
                 resultData[key][key1]['packets']['dl_retx_count']=(resultData[key][key1]['packets']['dl_retx_count'])/3;
               }
             }
           }
           // //console.log(resultData['cells'])
           tempArray[layer]=[];
           handle_statsData(layer,resultData);
         }
       }
     }
     else
     {
       tempArray[layer].push(statsFilteredData);
     }
 }
 else
 {
    // return;
 }
}

const handle_global_doughnut = (ueListData) => {
  // console.log("************ue list*************************");
  // console.log(ueListData);
  // console.log("**************end*****************************");

      let temp_nas_state_csv = [];
      let temp_rrc_state_csv = [];

      //nas//
      let registeredUEs = 0;
      let configurredUEs = 0;
      let deregisteredUEs = 0;
      let registeringUEs = 0;
      let deregisteringUEs = 0;
      let powerOffUEs = 0;

      //rrc //
      let connectedUEs = 0;
      let idleUEs = 0;
      let disconnectedUEs = 0;
      let connectingUEs = 0;

      for (let i = 0; i < ueListData['ue_list'].length; i++)
      {
        /// nas ///
        if (ueListData['ue_list'][i]['emm_state'] == 'registered')
        {
          registeredUEs++;
        }
        else if (ueListData['ue_list'][i]['emm_state'] == 'configured')
        {
          configurredUEs++;
        }
        else if (ueListData['ue_list'][i]['emm_state'] == 'deregistered')
        {
          deregisteredUEs++;
        }
        else if (ueListData['ue_list'][i]['emm_state'] == 'registering')
        {
          registeringUEs++;
        }
        else if (ueListData['ue_list'][i]['emm_state'] == 'deregistering')
        {
          deregisteringUEs++;
        }
        else if (ueListData['ue_list'][i]['emm_state'] == 'power off')
        {
          powerOffUEs++;
        }

        // rrc ///
        if (ueListData['ue_list'][i]['rrc_state'] == 'connected')
        {
          connectedUEs++;
        }
        else if (ueListData['ue_list'][i]['rrc_state'] == 'idle')
        {
          idleUEs++;
        }
        else if (ueListData['ue_list'][i]['rrc_state'] == 'disconnected')
        {
          disconnectedUEs++;
        }
        else if (ueListData['ue_list'][i]['rrc_state'] == 'connecting')
        {
          connectingUEs++;
        }

      }
        /////////////////for calculating csv/////////////
        temp_nas_state_csv.push(powerOffUEs);
        temp_nas_state_csv.push(registeringUEs);
        temp_nas_state_csv.push(deregisteringUEs);
        temp_nas_state_csv.push(configurredUEs);
        temp_nas_state_csv.push(registeredUEs);
        temp_nas_state_csv.push(deregisteredUEs);

        temp_rrc_state_csv.push(idleUEs);
        temp_rrc_state_csv.push(connectedUEs);
        temp_rrc_state_csv.push(disconnectedUEs);
        temp_rrc_state_csv.push(connectingUEs);
        /////////////////for calculating csv ends/////////////

        /////////////////csv data storing starts//////
        nasArray=[];
        rrcArray=[];

        nasArray=temp_nas_state_csv.slice();
        rrcArray=temp_rrc_state_csv.slice();
        // nasArray.push(temp_nas_state_csv.slice());
        // rrcArray.push(temp_rrc_state_csv.slice());
        
        // console.log("*********nas*********");
        // console.log(temp_nas_state_csv.slice());
        // console.log("**********rrc**********");        
        // console.log(temp_rrc_state_csv.slice());
        //console.log("////////////////////////////////////////////////////////////////");

            
}
module.exports ={handle_statsData,handle_global_doughnut};
