const userSchema = require('../modelsNew/users')
var userGroupsSchema = require('../modelsNew/userGroups')
var testUeStatsSchema = require('../modelsNew/ueStats')
var ueSimSchema = require('../modelsNew/ueSims')
var logSchema = require('../modelsNew/testLog')
var testCaseSchema = require('../modelsNew/testCases')
var testGlobalStatsSchema = require('../modelsNew/globalStats')
let mongoose = require("mongoose");
const { json } = require("body-parser");
let database = require("../connections/database_connection").getDb();

//////////Create functions///////////////
const CreateCollection = async (collectionName, schema, data) => {
  const Model = await database.mainDB.model(collectionName, schema);
  if (!(await Model.exists())) {
    let doc = await Model.create(data);
    // console.log(doc)
    if (doc) {
      console.log(`collection ${collectionName} created sucsessfully`);
      return true;
    } else {
      console.log("Error while creating collection");
      return false
    }
  } else {
    return console.log(`user/collection  ${collectionName} already exists`);
    return false
  }
};

const insertDocument = async (collectionName, schema, data) => {
  let Model = await database.mainDB.model(
    collectionName,
    schema
  );
  let doc = await Model.create(data);
  // console.log(doc)
  if (doc) {
    // console.log(`collection ${collectionName} created sucsessfully`);
    return true
  } else {
    // console.log("Error while creating collection");
    return false
  }
};

const insert = (collectionName, schema,field, object,query)=> {
  return new Promise((resolve,reject)=>{
   const Model = database.mainDB.model(collectionName, schema);
   Model.updateOne(
     query,
     { $push: { [field]: object } },
     { upsert: false,runValidators:true},
     (err, res) => {
      //  console.log(err,res)
       if(res && res.nModified == 1){
         resolve(true)
       }else{
         resolve(false)
       }
     }
   );
  })
 }

const insertSubdocument = (collectionName,Schema,field,object,query={})=> {
  return new Promise((resolve,reject)=>{
    const Model = database.mainDB.model(collectionName, Schema);
    if(field==='logSettings'){
     let logprofileName = object.logProfileName
    //  console.log(logprofileName)
     Model.findOne({'logSettings.logProfileName':logprofileName},(err,res)=>{
       if(err) return err;
       if(!res){
         insert(collectionName,Schema,field, object).then((res)=>{
           if(res){
             console.log(`logSettings SubDocument Inserted`)
             resolve(true)
           }else{
             console.log(`logSettings SubDocument Not Inserted`)
             resolve(false)
           }
         })            
       }else{
         console.log(`logSettings with logprofileName ${logprofileName} already exists`)
         resolve(false)
       }
     })
   }else{
     insert(collectionName,Schema,field,object,query).then((res)=>{
      //  console.log(res)
      if(res){
        // console.log(`SubDocument Inserted`)
        resolve(true)
      }else{
        // console.log(`SubDocument Not Inserted`)
        resolve(false)
      }
    })            
   }
   })
 }

 
//////////Create Function End///////////

//////Delete Function ////////

const deleteDocument= (collectionName, query)=> {
  return new Promise((resolve,reject)=>{
    const model = database.mainDB.collection(collectionName);
    model.deleteOne(query,
    (err, doc) => {
      if(err) reject(err)
      if (doc.result.n == 1) {
        console.log(`Document deleted Success`);
        resolve(true)
      } else {
        console.log(`No document found`);
        resolve(true)
      }
    })
  })
}


const deleteSubDocument = (collectionName, query, field, subdocquery) => {
  return new Promise((resolve,reject)=>{
    const Model = database.mainDB.collection(collectionName);
    Model.updateOne(query, { $pull: { [field]: subdocquery } }, (err, res) => {
    console.log(err);
    console.log(res.result);
    if (res.result.nModified != 0) {
      console.log(`Success: the subDocument was Removed`);
      resolve(true)
    } else {
      console.log(`subDocument Not found`);
      resolve(true)
    }
  });
  })
};

//////End OF Delete Function///////////

//////Read Functions/////////////

const readDocument = (collectionName, schema, query) => {
  return new Promise(async (resolve, reject) => {
    const Model = database.mainDB.model(collectionName, schema);
    // console.log()
    if (await Model.exists()) {
      Model.findOne(query, (err, doc) => {
        if (doc) {
          resolve({ message: "document found", document: doc });
        } else {
          console.log("document not found");
          resolve({ message: "document not found", error: err });
        }
      });
    } else {
      console.log(`collection ${collectionName} doesnot exist`);
      resolve({ message: `collection ${collectionName} doesnot exist` });
    }
  });
}

const readAllDocuments = (collectionName, schema,query={})=> {
  return new Promise(async (resolve, reject) => {
    const Model = database.mainDB.model(collectionName, schema);
    // console.log()
    if (await Model.exists()) {
      Model.find(query, (err, doc) => {
        if (doc) {
          resolve({ message: "document found", document: doc });
        } else {
          console.log("document not found");
          resolve({ message: "document not found", error: err });
        }
      });
    } else {
      console.log(`collection ${collectionName} doesnot exist`);
      resolve({ message: `collection ${collectionName} doesnot exist` });
    }
  });
}

const readSubDocument = async (
  collectionName,
  schema,
  query,
  field,
  subfield,
  subvalue
) => {
  return new Promise(async(resolve,reject)=>{
    const Model = database.mainDB.model(collectionName, schema);
  if (await Model.exists()) {
    Model.findOne(query, field, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result) {
        var subdocument = result[field].filter(function (elem) {
          return elem[subfield] === subvalue;
        }).pop()
        console.log(subdocument);
        resolve(true);
      }
    });
  } else {
    console.log(`collection ${collectionName} doesnot exist`);
    resolve(false);
  }
  })
};

const readAllSubDocument = async (
  collectionName,
  schema,
  query,
  field
) => {
  return new Promise((resolve,reject)=>{
    const Model = database.mainDB.model(collectionName,schema);
    Model.findOne(query, field, (err, result) => {
      // console.log(err,result)
    if (err) {
      resolve(err);
    }
    if (result) {
      let subdocuments = result[field]
      // console.log(subdocuments);
      resolve(true);
    }
  });
  })
};

// readAllSubDocument('user@simnovus.com_users',userSchema,{email:'user@simnovus.com'},'session')


//////END of Read Functions/////////////


/////////Update Functions////////////
const update = (collectionName, schema, query, update) => {
  return new Promise((resolve,reject)=>{
    const Model = database.mainDB.model(collectionName, schema);
    Model.updateOne(query,{$set:update},{runValidators:true,context: 'query',upsert:false},(err, res) => {
       // console.log(err);
       if(res){
         if (res.nModified == 1) {
           console.log(`SUCCESS:Document updated `);
           resolve(true);
         } else {
           console.log(`No document found/updated`);
           resolve(false);
         }
       }else{
         if(err)reject(err);
         resolve(false)
       }
     });
  })
}

let updateObj = {
  userRole: 'admin',
  loginAttempt: 0,
  status: 'active',
  userGroupList: [],
  ueSimList: [],
  email: 'user@simnovus.com',
  session: [
    {
      login:Date.now(),
    }
  ],
  logSettings: [],
  __v: 0
}

// update('users',userSchema,{'email':'user@simnovus.com'},updateObj)



const updateDocument = (collectionName, schema, query, field, value) => {
  return new Promise((resolve,reject)=>{
    const Model = database.mainDB.model(collectionName, schema);
    Model.updateOne(query, { $set: { [field]: value } }, {runValidators:true},(err, res) => {
       // console.log(err);
       if(res){
         if (res.nModified == 1) {
           console.log(`SUCCESS:Document updated `);
           resolve(true);
         } else {
           console.log(`No document found/updated`);
           resolve(false);
         }
       }else{
         if(err)reject(err);
         resolve(false)
       }
     });
  })
}

const updateSubDocument = (collectionName,schema,filter,field,value)=>{
  return new Promise((resolve,reject)=>{
    const Model = database.mainDB.model(collectionName,schema)
    Model.findOneAndUpdate(filter,{$set:{[field]:value}},{runValidators:true},(err,res)=>{
      if(err)resolve(err)
      console.log(err,res)
      if(res){
        resolve(true)
      }else{
        resolve(false)
      }
    })
  })
}


///End of update functions/////////

module.exports = {CreateCollection,insertDocument,insertSubdocument,readDocument,readSubDocument,readAllDocuments,readAllSubDocument,updateDocument,update,updateSubDocument,deleteDocument,deleteSubDocument};
