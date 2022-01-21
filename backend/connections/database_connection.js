var mongoose = require('mongoose');
var creden = require('./database');

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  keepAlive: true,
  autoIndex: false, // Don't build indexes
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

try {
  mongoose.mainConnection = mongoose.createConnection(`mongodb://${creden.ip_address}:${creden.port}/simulator_v1?compressors=zlib`, options)
  mongoose.sessionConnection = mongoose.createConnection(`mongodb://${creden.ip_address}:${creden.port}/sessionDB`, options)

  var mainDB = mongoose.mainConnection;
  mainDB.on('error', (e) => {
    console.log('Error');
  });
  mainDB.once('open', function () {
    console.log('database connected');
  });
  var sessionDB = mongoose.sessionConnection;
  sessionDB.on('error', (e) => {
    console.log('Error');
  });
  sessionDB.once('open', function () {
    console.log('session database connected');
  });
}
catch (e) {
  console.log(e);
}

function getDb() {
  let allDB = {};
  if (mainDB) {
    allDB.mainDB = mainDB;
  }
  if (sessionDB) {
    allDB.sessionDB = sessionDB;
  }
  return allDB;
}
module.exports = {
  getDb
};
