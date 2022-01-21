const express = require("express");
const cors = require("cors");
var helmet = require("helmet");
const logger = require("morgan");
var session = require("express-session");
const MongoStore = require("connect-mongo")(session);
var crypto = require("crypto");
const zlib = require("zlib");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const userRouter = require("./routes/userRoutes");
const testCaseRouter = require("./routes/testCaseRoutes");
// const checkToken = require("./helpers/checkToken");
// const loginRoute = require("./routes/login-routes");
// const authRoute = require("./routes/secure-routes");
const errorHandler = require("./controllers/errorController");
var database = require("./connections/database_connection");

const app = express();
const router = express.Router();

let mainDB = database.getDb();

/*******************************User Session Management **************************/

function genuuid(callback) {
  if (typeof callback !== "function") {
    return uuidFromBytes(crypto.randomBytes(16));
  }

  crypto.randomBytes(16, function (err, rnd) {
    if (err) return callback(err);
    callback(null, uuidFromBytes(rnd));
  });
}

function uuidFromBytes(rnd) {
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  rnd = rnd.toString("hex").match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rnd.shift();
  return rnd.join("-");
}

var sess = {
  genid: function (req) {
    return genuuid(); // use UUIDs for session IDs
  },
  secret: "simnovus emulator",
  saveUninitialized: true,
  resave: false,
  rolling: true,
  cookie: {
    maxAge: 86400000,
    // secure: true,
    httpOnly: true,
  },
  store: new MongoStore({ mongooseConnection: mainDB.sessionDB }),
};

app.use(session(sess));

/******************************** Ends ****************************/

app.use(express.json({ limit: "100kb" }));
//app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(helmet());


/* CORS whitelisting and access management */

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.all("*", function (req, res, next) {
  /**
   * Response settings
   * @type {Object}
   */
  var responseSettings = {
    AccessControlAllowOrigin: req.headers.origin, // *,
    AccessControlAllowHeaders:
      "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
    AccessControlAllowMethods: "POST, GET, PUT, DELETE, OPTIONS, PATCH",
    AccessControlAllowCredentials: true,
  };

  /**
   * Headers
   */

  res.header(
    "Access-Control-Allow-Credentials",
    responseSettings.AccessControlAllowCredentials
  );
  res.header(
    "Access-Control-Allow-Origin",
    responseSettings.AccessControlAllowOrigin
  );
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"]
      ? req.headers["access-control-request-headers"]
      : "x-requested-with"
  );
  res.header(
    "Access-Control-Allow-Methods",
    req.headers["access-control-request-method"]
      ? req.headers["access-control-request-method"]
      : responseSettings.AccessControlAllowMethods
  );

  if ("OPTIONS" == req.method) {
    res.status(200);
  } else {
    next();
  }
});

/************************************ Ends *******************************/

app.use(compression(zlib.constants.Z_BEST_COMPRESSION));
app.use(logger("dev"));

// if (app.get("env") === "production") {
//   app.set("trust proxy", 1); // trust first proxy
// }

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use("/api/users", userRouter);
app.use("/api/tests", testCaseRouter);

app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ message: "Can't find " + req.originalUrl + " on this server!" });
});

app.use(errorHandler);

// app.use("/api", router);
// loginRoute.init(router);

// /** Secure routing which cannot be accessed without user session */
// var secureRouter = express.Router();
// app.use("/secureAPI", secureRouter);
// secureRouter.use(checkToken);
// authRoute.init(secureRouter);

module.exports = app;
