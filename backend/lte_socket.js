require("rootpath")();
const websocket = require("nodejs-websocket");

require("./appManager.js");
// const statsModel = require('./models/stats_model');
const messageModel = require("./models/message_model");
const logsModel = require("./models/logs-model");
// const ueModel = require('./models/ue_get_model');
const statsFilterModule = require("./StatsFilterFunction");
const ueStatsFilterModule = require("./ueStatsFilterFunctions");

var closedConnection = true;
const proto = "ws";
let opt = { extraHeaders: { origin: "Test" } };

global.url;
global.ueDuration = [];
var ueFlag = 0;
var ueData = [];
var ueData1 = [];
var message_counter_temp = {};
var volte_message_counter_temp = {};

const volte_default_message = {
  REGISTER: 0,
  INVITE: 0,
  ACK: 0,
  "100/INVITE": 0,
  "200/PRACK": 0,
  "180/INVITE": 0,
  PRACK: 0,
  "200/INVITE": 0,
  UPDATE: 0,
  BYE: 0,
  "200/BYE": 0,
  "401/REGISTER": 0,
  "200/REGISTER": 0,
  "401/INVITE": 0,
  "481/INVITE": 0,
  "487/INVITE": 0,
  "183/INVITE": 0,
  CANCEL: 0,
  "408/INVITE": 0,
  "410/INVITE": 0,
  "410/REGISTER": 0,
  "403/REGISTER": 0,
  "400/REGISTER": 0,
  "500/REGISTER": 0,
  "503/REGISTER": 0,
  "504/REGISTER": 0,
};

const nas_rrc_default_message = {
  "5gs_nas_registration_accept": 0,
  "5gs_nas_registration_complete": 0,
  "5gs_nas_configuration_update_command": 0,
  "5gs_nas_authentication_request": 0,
  "5gs_nas_authentication_response": 0,
  "5gs_nas_security_mode_command": 0,
  "5gs_nas_security_mode_complete": 0,
  "5gs_nas_ul_nas_transport": 0,
  "5gs_nas_dl_nas_transport": 0,
  "5gs_nas_pdu_session_establishment_accept": 0,
  nas_attach_request: 0,
  nas_attach_accept: 0,
  nas_attach_reject: 0,
  nas_attach_complete: 0,
  nas_authentication_request: 0,
  nas_authentication_response: 0,
  nas_authentication_failure: 0,
  nas_authentication_reject: 0,
  nas_extended_service_request: 0,
  nas_control_plane_service_request: 0,
  nas_service_request: 0,
  nas_service_reject: 0,
  nas_service_accept: 0,
  nas_security_mode_command: 0,
  nas_security_mode_complete: 0,
  nas_security_mode_reject: 0,
  nas_detach_request: 0,
  nas_detach_accept: 0,
  nas_identity_request: 0,
  nas_identity_response: 0,
  nas_activate_default_eps_bearer_context_request: 0,
  nas_activate_default_eps_bearer_context_accept: 0,
  nas_activate_default_eps_bearer_context_reject: 0,
  nas_activate_dedicated_eps_bearer_context_request: 0,
  nas_activate_dedicated_eps_bearer_context_accept: 0,
  nas_activate_dedicated_eps_bearer_context_reject: 0,
  nas_modify_eps_bearer_context_request: 0,
  nas_modify_eps_bearer_context_accept: 0,
  nas_modify_eps_bearer_context_reject: 0,
  nas_deactivate_eps_bearer_context_request: 0,
  nas_deactivate_eps_bearer_context_accept: 0,
  nas_bearer_resource_allocation_request: 0,
  nas_bearer_resource_allocation_reject: 0,
  nas_bearer_resource_modification_request: 0,
  nas_bearer_resource_modification_reject: 0,
  nas_esm_information_request: 0,
  nas_esm_information_response: 0,
  nas_esm_data_transport: 0,
  nas_esm_status: 0,
  nas_tau_request: 0,
  nas_tau_accept: 0,
  nas_tau_reject: 0,
  nas_tau_complete: 0,
  nas_uplink_nas_transport: 0,
  nas_downlink_nas_transport: 0,
  nas_uplink_generic_nas_transport: 0,
  nas_downlink_generic_nas_transport: 0,
  nas_pdn_connectivity_request: 0,
  nas_pdn_connectivity_reject: 0,
  nas_pdn_disconnect_request: 0,
  nas_pdn_disconnect_reject: 0,
  nas_emm_information: 0,
  nas_emm_status: 0,
  nas_cs_service_notification: 0,
  nas_tp_close_ue_test_loop: 0,
  nas_tp_close_ue_test_loop_complete: 0,
  nas_tp_open_ue_test_loop: 0,
  nas_tp_open_ue_test_loop_complete: 0,
  nas_tp_activate_test_mode: 0,
  nas_tp_activate_test_mode_complete: 0,
  nas_tp_deactivate_test_mode: 0,
  nas_tp_deactivate_test_mode_complete: 0,
  nas_tp_reset_ue_pos_stored_info: 0,
  nas_registration_request: 0,
  nas_registration_accept: 0,
  nas_registration_complete: 0,
  nas_registration_reject: 0,
  nas_deregistration_request_dl: 0,
  nas_deregistration_accept_dl: 0,
  nas_deregistration_request_ul: 0,
  nas_deregistration_accept_ul: 0,
  nas_5gmm_status: 0,
  nas_notification: 0,
  nas_notification_response: 0,
  nas_ul_nas_transport: 0,
  nas_dl_nas_transport: 0,
  nas_pdu_session_establishment_request: 0,
  nas_pdu_session_establishment_accept: 0,
  nas_pdu_session_establishment_reject: 0,
  nas_pdu_session_authentication_command: 0,
  nas_pdu_session_authentication_complete: 0,
  nas_pdu_session_authentication_result: 0,
  nas_pdu_session_modification_request: 0,
  nas_pdu_session_modification_reject: 0,

  rrc_connection_request: 0,
  rrc_connection_reject: 0,
  rrc_connection_setup: 0,
  rrc_connection_setup_complete: 0,
  rrc_ul_information_transfer: 0,
  rrc_dl_information_transfer: 0,
  rrc_security_mode_command: 0,
  rrc_security_mode_complete: 0,
  rrc_security_mode_failure: 0,
  rrc_ue_capability_enquiry: 0,
  rrc_ue_capability_information: 0,
  rrc_connection_reconfiguration: 0,
  rrc_connection_reconfiguration_complete: 0,
  rrc_connection_reestablishment_request: 0,
  rrc_connection_reestablishment: 0,
  rrc_connection_reestablishment_complete: 0,
  rrc_measurement_report: 0,
  rrc_connection_release: 0,
  rrc_ue_information_request: 0,
  rrc_ue_information_response: 0,
  rrc_connection_resume_request: 0,
  rrc_csfb_parameters_response_cdma2000: 0,
  rrc_handover_from_eutra_preparation_request: 0,
  rrc_mobility_from_eutra_command: 0,
  rrc_counter_check: 0,
  rrc_logged_measurement_configuration: 0,
  rrc_rn_reconfiguration: 0,
  rrc_connection_resume: 0,
  rrc_csfb_parameters_request_cdma2000: 0,
  rrc_ul_handover_preparation_transfer: 0,
  rrc_counter_check_response: 0,
  rrc_proximity_indication: 0,
  rrc_rn_reconfiguration_complete: 0,
  rrc_mbms_counting_response: 0,
  rrc_inter_freq_rstd_measurement_indication: 0,
  rrc_ue_assistance_information: 0,
  rrc_in_device_coex_indication: 0,
  rrc_mbms_interest_indication: 0,
  rrc_scg_failure_information: 0,
  rrc_sidelink_ue_information: 0,
  rrc_wlan_connection_status_report: 0,
  rrc_connection_resume_complete: 0,
  rrc_ul_information_transfer_mrdc: 0,
  rrc_scg_failure_information_nr: 0,
  rrc_early_data_request: 0,
  rrc_early_data_complete: 0,
  rrc_connection_reestablishment_nb: 0,
  rrc_connection_reestablishment_reject_nb: 0,
  rrc_connection_reject_nb: 0,
  rrc_connection_setup_nb: 0,
  rrc_dl_information_transfer_nb: 0,
  rrc_connection_reconfiguration_nb: 0,
  rrc_connection_release_nb: 0,
  rrc_security_mode_command_nb: 0,
  rrc_ue_capability_enquiry_nb: 0,
  rrc_connection_resume_nb: 0,
  rrc_connection_reestablishment_request_nb: 0,
  rrc_connection_request_nb: 0,
  rrc_connection_resume_request_nb: 0,
  rrc_connection_reconfiguration_complete_nb: 0,
  rrc_connection_reestablishment_complete_nb: 0,
  rrc_connection_setup_complete_nb: 0,
  rrc_security_mode_complete_nb: 0,
  rrc_security_mode_failure_nb: 0,
  rrc_ue_capability_information_nb: 0,
  rrc_ul_information_transfer_nb: 0,
  rrc_connection_resume_complete_nb: 0,
  rrc_early_data_request_nb: 0,
  rrc_early_data_complete_nb: 0,
  nr_rrc_reject: 0,
  nr_rrc_setup: 0,
  nr_rrc_setup_request: 0,
  nr_rrc_resume_request: 0,
  nr_rrc_reestablishment_request: 0,
  nr_rrc_system_info_request: 0,
  nr_rrc_resume_request_1: 0,
  nr_rrc_resume: 0,
  nr_rrc_release: 0,
  nr_rrc_reestablishment: 0,
  nr_rrc_security_mode_command: 0,
  nr_rrc_dl_information_transfer: 0,
  nr_rrc_ue_capability_enquiry: 0,
  nr_rrc_counter_check: 0,
  nr_rrc_mobility_from_nr_command: 0,
  nr_rrc_measurement_report: 0,
  nr_rrc_reconfiguration_complete: 0,
  nr_rrc_setup_complete: 0,
  nr_rrc_reestablishment_complete: 0,
  nr_rrc_resume_complete: 0,
  nr_rrc_security_mode_complete: 0,
  nr_rrc_security_mode_failure: 0,
  nr_rrc_ul_information_transfer: 0,
  nr_rrc_location_measurement_indication: 0,
  nr_rrc_ue_capability_information: 0,
  nr_rrc_counter_check_response: 0,
  nr_rrc_ue_assistance_information: 0,
  nr_rrc_failure_information: 0,
  nr_rrc_ul_information_transfer_mrdc: 0,
  nr_rrc_scg_failure_information: 0,
  nr_rrc_scg_failure_information_eutra: 0,
};

//module.exports=io;

/***************** Connecting to LTE Service if it is closed ************************/

// setInterval(() => {
//   if (closedConnection == true) {
//     //console.log('Closed socket and reconnecting');
//     connect();
//   }
// }, 5000);

/************************************ Ends *******************************/

function getUrl() {
  return url;
}

//combine all rrc nas and volte messages
const combineMessageCounter = async (res) => {
  res = JSON.parse(res);

  let message_temp_data = [];
  let message_stored_label = [];
  let messageCounterSeries = [];
  message_temp_data.push(res["arrivalDate"]);
  message_stored_label.push("time");

  for (const [key, value] of Object.entries(res["counters"]["messages"])) {
    message_counter_temp[key] = value;
  }

  for (const [key, value] of Object.entries(message_counter_temp)) {
    if (key in nas_rrc_default_message) {
      nas_rrc_default_message[key] = value;
    }
  }

  for (const [key, value] of Object.entries(nas_rrc_default_message)) {
    message_stored_label.push(key);
    message_temp_data.push(value);
  }

  for (const [key, value] of Object.entries(volteMessages)) {
    volte_message_counter_temp[key] = value;
  }

  for (const [key, value] of Object.entries(volte_message_counter_temp)) {
    if (key in volte_default_message) {
      volte_default_message[key] = value;
    }
  }

  for (const [key, value] of Object.entries(volte_default_message)) {
    message_stored_label.push(key);
    message_temp_data.push(value);
  }

  messageCounterSeries.push(message_stored_label);
  messageCounterSeries.push(message_temp_data);
  //console.log(messageCounterSeries);

  io.emit("message_counter", messageCounterSeries);

  let newMessage = {
    arrivalDate: res["arrivalDate"],
    messages: message_temp_data,
  };
  await messageModel.create(newMessage, (err, messageCreated) => {
    if (err) {
      console.log(err);
      return err;
    }
  });
};

function logInsert(ueData, ueData1, currentDate) {
  var array = ueData["logs"];
  var i = 0;
  var spliceIndex = 0;
  var arrayLen = array.length;
  for (j = 0; j < volteData.length; j++) {
    console.log("volte Time");
    console.log(volteData[j]["timestamp"]);
    var d = new Date(volteData[j]["timestamp"]);
    console.log(d);
    if (volteData[j]["timestamp"] < array[arrayLen - 1]["timestamp"]) {
      i = 0;
      volteData[j]["data"][0] = volteData[j]["data"][0].split("\\:").join(":");
      volteData[j]["data"][0] = volteData[j]["data"][0].split("\\,").join(",");
      var dataArray = volteData[j]["data"][0].split("\\n");
      volteData[j]["data"] = [];
      for (var k = 0; k < dataArray.length; k++) {
        volteData[j]["data"].push(dataArray[k]);
      }
      for (
        var i = 0;
        i < array.length && compareByTime(array[i], volteData[j]) < 1;
        i++
      ) {}
      array.splice(i, 0, volteData[j]);
      ueData1["logs"].push(volteData[j]);
      spliceIndex = j + 1;
    } else {
      j = volteData.length - 1;
    }
    if (j == volteData.length - 1) {
      ueData["logs"] = array;
      volteData = volteData.slice(spliceIndex, volteData.Length);
      if (volteData.length <= 0) {
        volteFlag = 0;
      }
      ueData = JSON.stringify(ueData);
      let doc = { timestamp: currentDate.getTime(), data: ueData };
      io.emit("log_get", JSON.stringify(doc));
      //console.log("Data sent");
      terminateFlag = 0;
      logsModel.create(ueData1, (err, res) => {
        if (err) console.log(err);
      });
    }
  }
}

function compareByTime(a, b) {
  return a.timestamp - b.timestamp;
}

let connect = function (ipAddress) {
  /**Creating websocket to LTE Service */
  let uesim_port = 9002;
  // url = websocket.connect(proto + '://' + global.ue_ip + ":" + global.ue_port + '/', opt);
  url = websocket.connect(
    proto + "://" + ipAddress + ":" + uesim_port + "/",
    opt
  );
  let setLogInterval, setLogLevel;
  let i = 0;
  /** Called wehen socket is connected */
  url.on("connect", () => {
    console.log("Lte connection opened");
    closedConnection = false;
    if (closedConnection == true) {
      closedConnection = false;
    }

    setLogInterval = setInterval(() => {
      if (closedConnection == false) {
        i = i + 1;
        // url.send(JSON.stringify([
        //   { "message": 'stats', "min": 64, "max": 2048, "timeout": 1, "message_id": i, "rf": true },
        //   { "message": 'ue_get' },
        //   { "message": 'config_get', "timeout": 1 },
        //   { "message": 'log_get', "min": 64, "max": 2048, "timeout": 1, "message_id": i },
        //   { "message": 'rf'}
        // ]));
        url.send(
          JSON.stringify([
            {
              message: "stats",
              min: 64,
              max: 2048,
              timeout: 1,
              message_id: i,
              rf: true,
            },
            { message: "ue_get" },
            {
              message: "log_get",
              min: 64,
              max: 2048,
              timeout: 1,
              message_id: i,
            },
            { message: "config_get", timeout: 1 },
            { message: "rf" },
          ])
        );
      }
    }, 1000);
  });

  /** Resetting fields and emitting closed LTE notification to frontend when LTE socket is closed or some error occurs */

  url.on("close", function () {
    closedConnection = true;
    console.log("lte exiting close");
    let closedMsg = { closed: true };
    // mainServer.emit('closed_lte', closedMsg);
    io.emit("closed_lte", JSON.stringify({ status: 401, closed: true }));
    clearInterval(setLogInterval);
    return;
  });

  //Handling the LTE Error message and notifying the frontend
  url.on("error", function (e) {
    //console.log("lteSocket.js : web socket  error : "+e);
    closedConnection = true;
    io.emit("closed_lte", JSON.stringify({ status: 401, closed: true }));
    //console.log('exiting error');
    clearInterval(setLogInterval);
    return;
  });

  /** Receiving all the messages in textual type like logs,stats,etc */
  url.on("text", (msg) => {
    /** Emitting LTE service is not closed to frontend */
    io.emit("closed_lte", JSON.stringify({ status: 200, closed: false }));
    let msg1;
    try {
      /** Parsing Message to find out type of data received  and removing any inconsistencies in the JSON parsing*/
      msg1 = JSON.parse(
        msg.replace(/\bNaN\b/g, '"***NaN***"'),
        function (key, value) {
          return value === "***NaN***" ? NaN : value;
        }
      );
    } catch (e) {
      //console.log(e);
    } finally {
      if (msg1) {
        let currentDate = new Date();

        /** Managing the time in milliseconds as well as the local timezone date-time */
        msg1["arrivalDate"] = currentDate.getTime();
        msg1["extraDate"] = currentDate;

        /** Block for handling logging messages */
        if (msg1["message"] == "log_get") {
          if (msg1["logs"].length > 0) {
            if (ueFlag == 1) {
              if (volteFlag == 1) {
                ueData = JSON.parse(ueData);
                logInsert(ueData, ueData1, currentDate);
              } else {
                let doc = { timestamp: currentDate.getTime(), data: ueData };
                io.emit("log_get", JSON.stringify(doc));
                logsModel.create(ueData1, (err, res) => {
                  if (err) console.log(err);
                });
              }
            }
            ueFlag = 1;
            ueData = [];
            ueData1 = [];
            ueData = msg;
            ueData1 = msg1;
          }
        } else if (msg1["message"] == "config_get") {

        /** Handling Configuration messages */
          // console.log("Config emit");
          io.emit("config_get", msg1);
        } else if (msg1["message"] == "pdn_connect") {

        /*** Handling PDN Connect Messages */
          io.emit("pdn_connect", msg1);
        } else if (msg1["message"] == "rf") {

        /*** Rf data transmission ***/
          tx_gain = msg1["tx_gain"];
          rx_gain = msg1["rx_gain"];
          data = { tx_gain: tx_gain, rx_gain: rx_gain };
          io.emit("rf", data);
        } else if (msg1["message"] == "ue_get") {

        /** Handling all types of UE messages */
          io.emit("ue_get", msg1);
          ueStatsFilterModule.handle_UeData(1, msg1);
          statsFilterModule.handle_global_doughnut(msg1);
          // let ue_list = msg1;
          // /*************************** Ends ****************************/
          // ueModel.create(msg1, (err, res) => {
          //   if (err) {
          //     console.log(err);
          //   }
          // })
        }

        /** RF Messages management and splitting */
        // else if (msg1['message'] == 'rf') {
        //   let temp = msg1['rf_info'].trim().split(/\n\s*/);
        //   let regex = /PCIe\s*RFIC\s*#\d+:*/;
        //   let j = 0;
        //   let count = {};
        //   let current = -1;
        //   while (j < temp.length) {
        //     if (temp[j].match(regex)) {
        //       if (current == -1) {
        //         current = j;
        //       }
        //       else {
        //         count[temp[current]] = [];
        //         for (let m = current + 1; m < j; m++) {
        //           count[temp[current]].push(temp[m]);
        //         }
        //         temp.slice(current, j);
        //         current = j;
        //       }
        //     }
        //     if (current != -1 && j == temp.length - 1) {
        //       count[temp[current]] = [];
        //       for (let m = current + 1; m < j; m++) {
        //         count[temp[current]].push(temp[m]);
        //       }
        //       temp.slice(current, j);
        //       current = j;
        //     }
        //     j++;
        //   }
        //   msg1['data'] = count;
        //   io.emit('rf_msg', JSON.stringify(msg1));
        // }

        /** Saving statistics messages and sending it to frontend */
        else if (msg1["message"] == "stats") {
          io.emit("stats", JSON.stringify(msg1));
          statsFilterModule.handle_statsData(1, msg1);
          combineMessageCounter(JSON.stringify(msg1));
        } else if (msg1["message"] == "tau_request") {

        /** Handling TAU request messages */
          io.emit("tau_request", JSON.stringify(msg));
        }
      }
    }
  });

  /** Handling if any binary messages is received from LTE service */
  url.on("binary", function (stream) {
    //console.log("Sanjib: web socket  binary");
    io.emit("closed_lte", JSON.stringify({ status: 200, closed: false }));

    io.emit("received data", msg);
    stream.once("readable", function () {
      var data = stream.read(4);
      var size = data.readUInt32LE(0);
      var json = stream.read(size);
      var size = data.readUInt32LE(0);
      //console.log('==> Binary received', size, 'bytes');
      //console.log(JSON.parse(json));
      stream.read(size);
    });
  });
};

let sessionEnd = function () {
  url.close();
};

module.exports = {
  connect,
  sessionEnd,
  getUrl,
};

exports.connect = connect;
exports.sessionEnd = sessionEnd;
exports.getUrl = getUrl;
