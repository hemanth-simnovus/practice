const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let database = require("../connections/database_connection").getDb();

// before((done) => {
//   mongoose.connect("mongodb://localhost/mocha", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   mongoose.connection
//     .once("open", () => {
//       console.log('mongo connected');
//       done();
//     })
//     .on("error", (error) => {
//       console.warn("Warning", error);
//     });
// });

before((done)=>{
  database.mainDB.once('open',()=>{
    done()
  })
})

// after((done)=>{
//     database.mainDB.dropDatabase()
//     done()
//   })
  