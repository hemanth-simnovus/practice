const ueFilter = require('./models/ueModel')


var maxLayer=6 ;   /*Set max layer value to 5 as we have 5 layered structure*/
var tempArray={};

 /*function called to insert data into the database*/
function push_to_db_UE(layer,ueData)
{
  //console.log("Request received to push data to layer : ",layer);
  // //console.log("Stats Avg : ",ueData['ue_list']);
  // //console.log("\n\n")
  ueFilter[layer].create(ueData, (err, res) => {
			if (err)
        return false;
        //res.status(500).send({success:false, message:err});
      return true;
	})
}

async function processUeData(ueData)
{
  var result={};
  var uestatsLen=0;
  var count = 0;
  var len=Object.keys(ueData).length;
  if(ueData!={} && len>0)
  {
    uestatsLen=len;
    for(key in ueData)
    {
      count=count+1;
      if(key!= "rf" && key != "extraDate" && key!="counters" && key!="ue_list")
      {
        result[key]=ueData[key];
      }
      if(key=="ue_list")
      {
        result[key]={};
        var ueLen=ueData[key].length;
        for(var i=0;i<ueLen;i++)
        {
          let ueId=ueData[key][i]['ue_id'];
          // //console.log("The ue id is : ",ueId);
          result[key][ueId]={};
          result[key][ueId]['imsi']=ueData[key][i]['imsi'];
          result[key][ueId]['throughput']={};
          result[key][ueId]['schedule']={};
          result[key][ueId]['packets']={};
          result[key][ueId]['rsrp']={};
          result[key][ueId]['mcs']={};
          result[key][ueId]['throughput']['dl_bitrate']=ueData[key][i]['dl_bitrate'];
          result[key][ueId]['throughput']['ul_bitrate']=ueData[key][i]['ul_bitrate'];
          if(ueData[key][i]['dl_sched_users_avg']!=undefined)
          {
              result[key][ueId]['schedule']['dl_sched_users_avg']=ueData[key][i]['dl_sched_users_avg'];
          }
          if(ueData[key][i]['ul_sched_users_avg']!=undefined)
          {
            result[key][ueId]['schedule']['ul_sched_users_avg']=ueData[key][i]['ul_sched_users_avg'];
          }
          result[key][ueId]['packets']['dl_rx_count']=ueData[key][i]['dl_rx_count'];
          result[key][ueId]['packets']['dl_err_count']=ueData[key][i]['dl_err_count'];
          result[key][ueId]['packets']['ul_tx_count']=ueData[key][i]['ul_tx_count'];
          result[key][ueId]['packets']['ul_retx_count']=ueData[key][i]['ul_retx_count'];
          result[key][ueId]['packets']['dl_retx_count']=ueData[key][i]['dl_retx_count'];
          if(ueData[key][i]['rsrp']!=undefined )
          {
            result[key][ueId]['rsrp']['rsrp']=ueData[key][i]['rsrp'];
          }
          if(ueData[key][i]['cqi']!=undefined)
          {
            result[key][ueId]['rsrp']['cqi']=ueData[key][i]['cqi'];
          }
          if(ueData[key][i]['snr']!=undefined)
          {
            result[key][ueId]['rsrp']['snr']=ueData[key][i]['snr'];
          }
          if(ueData[key][i]['ri']!=undefined)
          {
            result[key][ueId]['rsrp']['ri']=ueData[key][i]['ri'];
          }
          if(ueData[key][i]['dl_mcs']!=undefined )
          {
            result[key][ueId]['mcs']['dl_mcs']=ueData[key][i]['dl_mcs'];
          }
          if(ueData[key][i]['ul_mcs']!=undefined)
          {
            result[key][ueId]['mcs']['ul_mcs']=ueData[key][i]['ul_mcs'];
          }
          // //console.log(result);
        }
      }
      if(count===uestatsLen)
      {
        // //console.log(result)
        return result;
      }
    }
  }
}

/*function called when data is received*/
async function handle_UeData(layer,ueData)
{
  var ueFilteredData={}
  if(layer==1)
  {
    ueFilteredData = await processUeData(ueData);
  }
  else
  {
    ueFilteredData = ueData;
  }
  // //console.log("Processed Data is  : ",ueFilteredData["ue_list"]);

  push_to_db_UE(layer,ueFilteredData);
	layer=layer+1;
	if (layer < maxLayer )
  {
      if(tempArray[layer]==undefined)
      {
        tempArray[layer]=[];
      }
	    if(tempArray[layer].length==2) /*Layer threshold check*/
      {
        tempArray[layer].push(ueFilteredData);
        // //console.log(tempArray[layer]);=
        // var result={};
        var count=0;
        var resultData={}
        var ueCount=0;
        for(var i=0;i<tempArray[layer].length;i++)
        {
          if(ueCount==0)
          {
            // //console.log(tempArray[layer][i]);
            for(key in tempArray[layer][i])
            {
              resultData[key]={};
              // //console.log(key)
              if(key=='ue_list')
              {
                for(key1 in tempArray[layer][i][key])
                {
                  resultData[key][key1]={};
                  resultData[key][key1]['throughput']={};
                  resultData[key][key1]['schedule']={};
                  resultData[key][key1]['packets']={};
                  resultData[key][key1]['rsrp']={};
                  resultData[key][key1]['mcs']={};
                  resultData[key][key1]['throughput']['dl_bitrate']=0;
                  resultData[key][key1]['throughput']['ul_bitrate']=0;
                  resultData[key][key1]['schedule']['dl_sched_users_avg']=0;
                  resultData[key][key1]['schedule']['ul_sched_users_avg']=0;
                  resultData[key][key1]['packets']['dl_rx_count']=0;
                  resultData[key][key1]['packets']['dl_err_count']=0;
                  resultData[key][key1]['packets']['ul_tx_count']=0;
                  resultData[key][key1]['packets']['ul_retx_count']=0;
                  resultData[key][key1]['packets']['dl_retx_count']=0;
                  resultData[key][key1]['rsrp']['rsrp']=0;
                  resultData[key][key1]['rsrp']['cqi']=0;
                  resultData[key][key1]['rsrp']['snr']=0;
                  resultData[key][key1]['rsrp']['ri']=0;
                  resultData[key][key1]['mcs']['dl_mcs']=0;
                  resultData[key][key1]['mcs']['ul_mcs']=0;
                }
                ueCount=1;
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
            if(key=='ue_list')
            {
              // //console.log(tempArray[layer][i][key]);
              for(key1 in tempArray[layer][i][key])
              {
                //console.log("\n\n");
                resultData[key][key1]['throughput']['dl_bitrate']=resultData[key][key1]['throughput']['dl_bitrate']+tempArray[layer][i][key][key1]['throughput']['dl_bitrate'];
                resultData[key][key1]['throughput']['ul_bitrate']=resultData[key][key1]['throughput']['ul_bitrate']+tempArray[layer][i][key][key1]['throughput']['ul_bitrate'];
                if(Object.keys(tempArray[layer][i][key][key1]['schedule']).length)
                {
                  resultData[key][key1]['schedule']['dl_sched_users_avg']=resultData[key][key1]['schedule']['dl_sched_users_avg']+tempArray[layer][i][key][key1]['schedule']['dl_sched_users_avg'];
                  resultData[key][key1]['schedule']['ul_sched_users_avg']=resultData[key][key1]['schedule']['ul_sched_users_avg']+tempArray[layer][i][key][key1]['schedule']['ul_sched_users_avg'];
                }
                resultData[key][key1]['packets']['dl_rx_count']=  resultData[key][key1]['packets']['dl_rx_count']+tempArray[layer][i][key][key1]['packets']['dl_rx_count'];
                resultData[key][key1]['packets']['dl_err_count']=resultData[key][key1]['packets']['dl_err_count']+tempArray[layer][i][key][key1]['packets']['dl_err_count'];
                resultData[key][key1]['packets']['ul_tx_count']=resultData[key][key1]['packets']['ul_tx_count']+tempArray[layer][i][key][key1]['packets']['ul_tx_count'];
                resultData[key][key1]['packets']['ul_retx_count']=resultData[key][key1]['packets']['ul_retx_count']+tempArray[layer][i][key][key1]['packets']['ul_retx_count'];
                resultData[key][key1]['packets']['dl_retx_count']=resultData[key][key1]['packets']['dl_retx_count']+tempArray[layer][i][key][key1]['packets']['dl_retx_count'];
                if(Object.keys(tempArray[layer][i][key][key1]['rsrp']).length)
                {
                  resultData[key][key1]['rsrp']['rsrp']=resultData[key][key1]['rsrp']['rsrp']+tempArray[layer][i][key][key1]['rsrp']['rsrp'];
                  resultData[key][key1]['rsrp']['cqi']=resultData[key][key1]['rsrp']['cqi']+tempArray[layer][i][key][key1]['rsrp']['cqi'];
                  resultData[key][key1]['rsrp']['snr']=resultData[key][key1]['rsrp']['snr']+tempArray[layer][i][key][key1]['rsrp']['snr'];
                  resultData[key][key1]['rsrp']['ri']=resultData[key][key1]['rsrp']['ri']+tempArray[layer][i][key][key1]['rsrp']['ri'];
                }
                if(Object.keys(tempArray[layer][i][key][key1]['mcs']).length)
                {
                  resultData[key][key1]['mcs']['dl_mcs']=resultData[key][key1]['mcs']['dl_mcs']+tempArray[layer][i][key][key1]['mcs']['dl_mcs'];
                  resultData[key][key1]['mcs']['ul_mcs']=resultData[key][key1]['mcs']['ul_mcs']+tempArray[layer][i][key][key1]['mcs']['ul_mcs'];
                }
              }
              // ueCount=1;
            }
            else
            {
              resultData[key]=tempArray[layer][i][key];
            }
          }
          if(count==tempArray[layer].length)
          {
            // ueCount=0;
            count=0;
            for(key in resultData)
            {
              if(key=="ue_list")
              {
                for(key1 in resultData[key])
                {
                  //console.log("\n\n")
                  //console.log("Layer is : ",layer);
                  // //console.log(resultData[key][key1]['throughput']['dl_bitrate'])
                  resultData[key][key1]['throughput']['dl_bitrate']=(resultData[key][key1]['throughput']['dl_bitrate'])/3;
                  // //console.log("Throughput : ",resultData[key][key1]['throughput']['dl_bitrate'])
                  resultData[key][key1]['throughput']['ul_bitrate']=(resultData[key][key1]['throughput']['ul_bitrate'])/3;
                  if(Object.keys(resultData[key][key1]['schedule']).length)
                  {
                    resultData[key][key1]['schedule']['dl_sched_users_avg']=(resultData[key][key1]['schedule']['dl_sched_users_avg'])/3;
                    resultData[key][key1]['schedule']['ul_sched_users_avg']=(resultData[key][key1]['schedule']['ul_sched_users_avg'])/3;
                  }
                  resultData[key][key1]['packets']['dl_rx_count']= (resultData[key][key1]['packets']['dl_rx_count'])/3;
                  resultData[key][key1]['packets']['dl_err_count']=(resultData[key][key1]['packets']['dl_err_count'])/3;
                  resultData[key][key1]['packets']['ul_tx_count']=(resultData[key][key1]['packets']['ul_tx_count'])/3;
                  resultData[key][key1]['packets']['ul_retx_count']=(resultData[key][key1]['packets']['ul_retx_count'])/3;
                  resultData[key][key1]['packets']['dl_retx_count']=(resultData[key][key1]['packets']['dl_retx_count'])/3;
                  if(Object.keys(tempArray[layer][i][key][key1]['rsrp']).length)
                  {
                    resultData[key][key1]['rsrp']['rsrp']=((resultData[key][key1]['rsrp']['rsrp'])>0)?((resultData[key][key1]['rsrp']['rsrp'])/3):resultData[key][key1]['rsrp']['rsrp'];
                    resultData[key][key1]['rsrp']['cqi']=((resultData[key][key1]['rsrp']['cqi'])>0)?((resultData[key][key1]['rsrp']['cqi'])/3):resultData[key][key1]['rsrp']['cqi'];
                    resultData[key][key1]['rsrp']['snr']=((resultData[key][key1]['rsrp']['snr'])>0)?((resultData[key][key1]['rsrp']['snr'])/3):resultData[key][key1]['rsrp']['snr'];
                    resultData[key][key1]['rsrp']['ri']=((resultData[key][key1]['rsrp']['ri'])>0)?((resultData[key][key1]['rsrp']['ri'])/3):resultData[key][key1]['rsrp']['ri'];;
                  }
                  if(Object.keys(tempArray[layer][i][key][key1]['mcs']).length)
                  {
                    resultData[key][key1]['mcs']['dl_mcs']=((resultData[key][key1]['mcs']['dl_mcs'])>0)?((resultData[key][key1]['mcs']['dl_mcs'])/3):resultData[key][key1]['mcs']['dl_mcs'];
                    resultData[key][key1]['mcs']['ul_mcs']=((resultData[key][key1]['mcs']['ul_mcs'])>0)?((resultData[key][key1]['mcs']['ul_mcs'])/3):resultData[key][key1]['mcs']['ul_mcs'];
                  }
                }
              }
            }
            // //console.log(resultData['ue_list'])
            tempArray[layer]=[];
            handle_UeData(layer,resultData);
          }
        }
      }
      else
      {
      	tempArray[layer].push(ueFilteredData);
      }
  }
  else
  {
	   // return;
  }

}


module.exports ={handle_UeData};
