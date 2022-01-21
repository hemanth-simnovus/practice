"use strict";

const http = require("http");

const socket_parameters = require("./connections/socket_parameters");
const commonFunction = require("./common/commonFunctions");
const app = require("./app");

const ip = "0.0.0.0";
var server_port = socket_parameters.server_port;
const port = process.env.BACKEND_PORT || process.env.PORT || server_port;

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

var mainServer = http.createServer(app);
global.io = require("socket.io")(mainServer);

require("./connections/database_connection");

//Creating first user if no users are there in the database
commonFunction.checkForUser();

//connect to appmanager when we restart node
commonFunction.checkForUE();

/** Listening for errors on NodeJS Server and making NodeJS listen on fixed IP and port */
mainServer.on("error", (err) => console.error(err));

const server = mainServer.listen(port, ip, () => {
  console.log(`Listening on: ${ip}.${port}`);
});

/** Handling frontend and backend socket connection and disconnection */
io.on("connect", (socket) => {
  //console.log(socket.client.conn.remoteAddress);
  //console.log(`Client connected [id=${socket.id}]`);
  socket.on("disconnect", () => {
    //console.log("Disconnecting");
  });
});

//graceful shutdown
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGUSR2", function () {
  process.exit();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});

// const ueCon= require('./connections/socket_parameters.js');
// const lte_socket = require('./lte_socket');
// const appManager = require('./appManager.js');
//const system = require('system-commands');
// var ue_Username = ueCon.ue_UserName;
// var ue_Password = ueCon.ue_Password;
// var ue_ip=ueCon.ue_ip;

//system('./getRfCardData.sh '+ue_ip +' '+ue_Username+' '+ue_Password).then((value)=>{console.log(value)});
//system('./startAppManager.sh '+appManager_ip +' '+appManager_UserName+' '+appManager_Password).then((value)=>{console.log(value)});
//lte_socket.connect();
//appManager.connect();
