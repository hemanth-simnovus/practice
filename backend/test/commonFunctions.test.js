const mongoose = require("mongoose");
const { expect } = require("chai");
const {CreateCollection,insertDocument,readDocument,update,readSubDocument,readAllDocuments,readAllSubDocument,insertSubdocument,updateSubDocument,updateDocument,deleteDocument,deleteSubDocument} = require('../global/functions')
const userSchema = require('../modelsNew/users')
var userGroupsSchema = require('../modelsNew/userGroups')
var testUeStatsSchema = require('../modelsNew/ueStats')
var ueSimSchema = require('../modelsNew/ueSims')
var logSchema = require('../modelsNew/testLog')
var testCaseSchema = require('../modelsNew/testCases')
var testGlobalStatsSchema = require('../modelsNew/globalStats')
const data = require('./testData')
let database = require("../connections/database_connection").getDb();
let user =  {
  email: "hemanth.k@simnovus.com",
  fullName: "Simnovus bangalore",
  userName: "SimnovusUser32",
  password: "Simnovus@123",
  userRole: "admin",
  status:'active'
}

describe('update user',()=>{
  // it('update user for one field',async()=>{
  //   await insertDocument('users',userSchema,user).then((a)=>{
  //     console.log(a)
  //     expect(a).is.equal(true)
  //   })
  //   await readDocument('users',userSchema,{email:user.email}).then(async(response)=>{
  //     let document = response.document
  //     expect(response.message).is.equal('document found')
  //     expect(document.status).is.equal('active')
  //     let updateObj = {
  //       status:'deactive'
  //     }
  //     await update('users',userSchema,{'email':user.email},updateObj).then((response)=>{
  //       expect(response).is.equal(true)
  //     })
  //   })
  //   await readDocument('users',userSchema,{email:user.email}).then(async(response)=>{
  //     let document = response.document
  //     expect(document.status).is.equal('deactive')
  //   })
  //   await deleteDocument('users',{'email':'hemanth.k@simnovus.com'})
  //  })
  //  it('update user for multiple fields',async()=>{
  //   await insertDocument('users',userSchema,user).then((a)=>{
  //     console.log(a)
  //     expect(a).is.equal(true)
  //   })
  //   await readDocument('users',userSchema,{email:user.email}).then(async(response)=>{
  //     let document = response.document
  //     expect(response.message).is.equal('document found')
  //     expect(document.status).is.equal('active')
  //     expect(document.userRole).is.equal('admin')
  //     expect(document.fullName).is.equal("Simnovus bangalore")
  //     let updateObj = {
  //       status:'deactive',
  //       userRole:'creator',
  //       fullName:'Simnovus'
  //     }
  //     await update('users',userSchema,{'email':user.email},updateObj).then((response)=>{
  //       expect(response).is.equal(true)
  //     })
  //     await readDocument('users',userSchema,{email:user.email}).then(async(response)=>{
  //       let document = response.document
  //       expect(response.message).is.equal('document found')
  //       expect(document.status).is.equal('deactive')
  //       expect(document.userRole).is.equal('creator')
  //       expect(document.fullName).is.equal("Simnovus")
  //     })
  //   })
  //   await deleteDocument('users',{'email':'hemanth.k@simnovus.com'})
  //  })
   it('update user for whole json',async()=>{
    // await insertDocument('users',userSchema,user).then((a)=>{
    //   console.log(a)
    //   expect(a).is.equal(true)
    // })
    await readDocument('users',userSchema,{email:user.email}).then(async(response)=>{
      let document = response.document
      expect(response.message).is.equal('document found')
      // expect(document.status).is.equal('active')
      // expect(document.userRole).is.equal('admin')
      // expect(document.fullName).is.equal("Simnovus bangalore")
      let updateObj = {
        status:'deactive',
        userRole:'creator',
        fullName:'Simnovus',
        logSettings:[  {
          logProfileName: "profile0",
          settings: {
            sip: "debug",
            ip: "info",
            nas: "debug",
            rrc: "info",
            pdcp: "debug",
            rlc: "info",
            mac: "debug",
            phy: "info",
            displaySecurityKeys: true,
            displayEncyptedPayload: false,
            savePhySignals: false,
          }
        }
        ]
      }
      await update('users',userSchema,{'email':user.email,'logSettings.logProfileName':'profile0'},updateObj).then((response)=>{
        expect(response).is.equal(true)
      })
      await readDocument('users',userSchema,{email:user.email}).then(async(response)=>{
        let document = response.document
        expect(response.message).is.equal('document found')
        expect(document.status).is.equal('deactive')
        expect(document.userRole).is.equal('creator')
        expect(document.fullName).is.equal("Simnovus")
      })
    })
    // await deleteDocument('users',{'email':'hemanth.k@simnovus.com'})
   })
  })



// describe('Create',()=>{
//   describe(`User create `, () => {
//     it(`should create users collection`,async()=>{
//       await CreateCollection('users',userSchema,data.userObj[0]).then((res)=>{
//       expect(res,`users collection created NOT success`).to.equal(true)
//      })
//     })
//     data.users.forEach((obj)=>{
//       it(`inserting users documents`,async()=>{
//        await insertDocument('users',userSchema,obj).then((res)=>{
//           expect(res).to.equal(true)
//          })
//       })
//     })
//     for(let i=0;i<data.userObj.length;i++){
//       let email = data.userObj[i].email
//       it(`creating ${email} user`,async()=>{
//         await CreateCollection(data.userObj[i].email,userSchema,data.userObj[i]).then((res)=>{
//         expect(res,`${email} created NOT success`).to.equal(true)
//        })
//       })
//      }
//      for(let i=0;i<data.LogSettingSubDocument.length;i++){
//        it(`inserting subdocument for ${i} logsettings`,async()=>{
//          await insertSubdocument(data.userObj[0].email,userSchema,'logSettings',data.LogSettingSubDocument[i]).then((res)=>{
//          expect(res).to.equal(true)
//         })
//        })
//       }
//      for(let i=0;i<data.SessionObj.length;i++){
//         it(`inserting subdocument for ${i} Session`,async()=>{
//           await insertSubdocument(data.userObj[0].email,userSchema,'session',data.SessionObj[i]).then((res)=>{
//           expect(res).to.equal(true)
//          })
//         })
//        }
//   })
//   describe(`testcase create`, () => {
//     data.testcaseObj.forEach((obj)=>{
//       let testcaseName = obj['testcaseName']
//       it(`creating testcase ${testcaseName} `,async()=>{
//        await insertDocument('user@simnovus.com'+'_'+'testcase',testCaseSchema,obj).then((res)=>{
//           expect(res,`${testcaseName} created NOT success`).to.equal(true)
//          })
//       })
//     })
//     for(let i=0;i<data.executionHistory.length;i++){
//       it(`inserting executionHistory subdocument`,async()=>{
//         insertSubdocument('user@simnovus.com_testcases',testCaseSchema,'executionHistory',data.executionHistory[i],{testcaseName:'testcase0'})
//         .then((res)=>{
//         expect(res).to.equal(true)
//        })
//       })
//      }
//      for(let i=0;i<data.editHistory.length;i++){
//       it(`inserting editHistory subdocument`,async()=>{
//         await insertSubdocument('user@simnovus.com_testcases',testCaseSchema,'editHistory',data.editHistory[i],{testcaseName:'testcase0'})
//         .then((res)=>{
//         expect(res).to.equal(true)
//        })
//       })
//      }
//      for(let i=0;i<data.executionSchedule.length;i++){
//       it(`inserting executionSchedule subdocument`,async()=>{
//         await insertSubdocument('user@simnovus.com_testcases',testCaseSchema,'executionSchedule',data.executionSchedule[i],{testcaseName:'testcase0'})
//         .then((res)=>{
//         expect(res).to.equal(true)
//        })
//       })
//      }
//   })
//   describe(`usergroup create`, () => {
//     data.usergroupObj.forEach((obj)=>{
//       let groupName = obj['groupName']
//       it(`creating ${groupName} groupname `,async()=>{
//         await insertDocument('usergroups',userGroupsSchema,obj).then((res)=>{
//         expect(res,`${groupName} created NOT success`).to.equal(true)
//        })
//       })
//     })
//   })
//   describe(`uesim create`, () => {
//     data.uesim.forEach((obj)=>{
//       let ueSimId = obj['ueSimId']
//       it(`creating ${ueSimId} `,async()=>{
//         await insertDocument('uesims',ueSimSchema,obj).then((res)=>{
//         expect(res,`${ueSimId} created NOT success`).to.equal(true)
//        })
//       })
//     })
//   })
//   describe(`logs create`, () => {
//     data.logs.forEach((obj)=>{
//       let testcaseName = obj['testcaseName']
//       it(`creating {${testcaseName}} logs`,async()=>{
//         let collectionname = `user@simnovus.com_ue${obj['ueSimId']}_logs`
//         await insertDocument(collectionname,logSchema,obj).then((res)=>{
//         expect(res,`${testcaseName} created NOT success`).to.equal(true)
//        })
//       })
//     })
//   })
//  //specify default email :id
//   describe(`stats create`, () => {
//     data.stats.forEach((obj)=>{
//       let testcaseName = obj['testcaseName']
//       it(`creating stats for {${testcaseName}} `,async()=>{
//         let collectionname = `user@simnovus.com_ue${obj['ueSimId']}_globalstats`
//         await insertDocument(collectionname,testGlobalStatsSchema,obj).then((res)=>{
//         expect(res,`${testcaseName} created NOT success`).to.equal(true)
//        })
//       })
//     })
//   })
//   describe(`uestats create`, () => {
//     data.uestats.forEach((obj)=>{
//       let testcaseName = obj['testcaseName']
//       let collectionname = `user@simnovus.com_ue${obj['ueSimId']}_uestats`
//       // console.log(collectionname)
//       it(`creating uestats for ${testcaseName} `,async()=>{
//         await insertDocument(collectionname,testUeStatsSchema,obj).then((res)=>{
//         expect(res,`${testcaseName} created NOT success`).to.equal(true)
//        })
//       })
//     })
//   })
// })

// describe('Read',()=>{
//   describe(`Read User`, () => {
//     it(`should read user document`,async() => {
//       await readDocument('user@simnovus.com',userSchema,{'email':'user@simnovus.com'}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read ALL users`,async() => {
//       await readAllDocuments('user@simnovus.com',userSchema).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read LogSetting Subdocument`,async() => {
//       await readSubDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com'},'logSettings','logProfileName','profile0').then((res)=>{
//         expect(res).is.equal(true)
//       })
//     })
//     it(`should read session Subdocument`,async() => {
//       await readSubDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com'},'session','login','2022-01-01').then((res)=>{
//         expect(res).is.equal(true)
//       })
//     })
//     it(`should read All session subDocuments `,async() => {
//       await readAllSubDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com'},'session').then((res)=>{
//         expect(res).is.equal(true)
//       })
//     })
//     it(`should read All LogSetting Subdocuments`,async() => {
//       await readAllSubDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com'},'logSettings',).then((res)=>{
//         // console.log(doc)
//         expect(res).is.equal(true)
//       })
//     })
//   })

//   describe(`Read testcase`, () => {
//     it(`should read testcase document`,async() => {
//       await readDocument('user@simnovus.com_testcases',testCaseSchema,{'testcaseName':'testcase0'}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read All testcase document`,async() => {
//       await readAllDocuments('user@simnovus.com_testcases',testCaseSchema).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
  
//     it(`should Read executionHistory subdocument`, async () => {
//       await readSubDocument(
//         "user@simnovus.com_testcases",
//         testCaseSchema,
//         { testcaseName: "testcase0" },
//         "executionHistory",
//         "time",
//         "12345"
//       ).then((res) => {
//         expect(res).is.equal(true);
//       });
//     });
//     it(`should Read ALL executionHistory subdocument`, async () => {
//       await readAllSubDocument(
//         "user@simnovus.com_testcases",
//         testCaseSchema,
//         {testcaseName: "testcase0" },
//         "executionHistory"
//       ).then((res) => {
//         expect(res).is.equal(true);
//       });
//     });
//     it(`should Read EditHistory subdocument`, async () => {
//       await readSubDocument(
//         "user@simnovus.com_testcases",
//         testCaseSchema,
//         {testcaseName: "testcase0"},
//         "editHistory",
//         "time",
//         "1221122"
//       ).then((res) => {
//         expect(res).is.equal(true);
//       });
//     });
//     it(`should Read ALL editHistory subdocument`, async () => {
//       await readAllSubDocument(
//         "user@simnovus.com_testcases",
//         testCaseSchema,
//         { testcaseName: "testcase0" },
//         "editHistory"
//       ).then((res) => {
//         expect(res).is.equal(true);
//       });
//     });
//     it(`should Read ExecutionSchedule subdocument`, async () => {
//       await readSubDocument(
//         "user@simnovus.com_testcases",
//         testCaseSchema,
//         {testcaseName: "testcase0"},
//         "executionSchedule",
//         "time",
//         "12332453"
//       ).then((res) => {
//         expect(res).is.equal(true);
//       });
//     });
//     it(`should Read ALL executionSchedule subdocument`, async () => {
//       await readAllSubDocument(
//         "user@simnovus.com_testcases",
//         testCaseSchema,
//         { testcaseName: "testcase0" },
//         "executionSchedule"
//       ).then((res) => {
//         expect(res).is.equal(true);
//       });
//     });
//   })
//   describe(`Read usergroup`, () => {
//     it(`should read usergroup document`,async() => {
//       await readDocument('usergroups',userGroupsSchema,{'groupName':'group0'}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read All usergroup documents`,async() => {
//       await readAllDocuments('usergroups',userGroupsSchema).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//   })

//   describe(`Read uesim`, () => {
//     it(`should read uesim document`,async() => {
//       await readDocument('uesims',ueSimSchema,{'ueSimId':1}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read All uesim documents`,async() => {
//       await readAllDocuments('uesims',ueSimSchema).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//   })

//   describe(`Read logs`, () => {
//     it(`should read logs document`,async() => {
//       await readDocument('user@simnovus.com_ue1_logs',logSchema,{'arrivalDate':'2021-12-31','testcaseName':'test0'}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read All logs documents`,async() => {
//       await readAllDocuments('user@simnovus.com_ue1_logs',logSchema,{'arrivalDate':{$lte:'2022-01-03'}}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//   })

//   describe(`Read stats`, () => {
//     it(`should read stats document`,async() => {
//       await readDocument('user@simnovus.com_ue1_globalstats',testGlobalStatsSchema,{'testcaseName':'test0','arrivalDate':'1970-01-01'}).then((doc)=>{
//         expect(doc.message).is.equal('document found')
//       })
//     })
//     it(`should read All stats document`,async() => {
//       await readAllDocuments('user@simnovus.com_ue2_globalstats',testGlobalStatsSchema,{'arrivalDate':{$gte:'2022-01-04'}}).then((doc)=>{
//         expect(doc.message).is.equal('document found')
//       })
//     })
//   })

//   describe(`Read uestats`, () => {
//     it(`should read uestats document`,async() => {
//       await readDocument('user@simnovus.com_ue1_uestats',testUeStatsSchema,{'testcaseName':'test1','arrivalDate':'1970-01-01'}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })

//     it(`should read all uestats documents`,async() => {
//       await readAllDocuments('user@simnovus.com_ue1_uestats',testUeStatsSchema,{'arrivalDate':{$gte:'2022-01-04'}}).then((doc)=>{
//         // console.log(doc)
//         expect(doc.message).is.equal('document found')
//       })
//     })
//   })
// })

// describe('update',()=>{


//  describe(`update User`, () => {
//    it(`should update user document`,async() => {
//      await updateDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com'},'status','deactive').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//    it(`should update user subdocument logSettings`,async() => {
//      await updateSubDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com','logSettings.logProfileName':'profile1'},'logSettings.$.settings',data.LogSettingSubDocument[1].settings).then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//    it(`should update user subdocument session`,async() => {
//      await updateSubDocument('user@simnovus.com',userSchema,{email:'user@simnovus.com','session.login':'2022-01-01'},'session.$.logout','2022-01-02').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
   
//  })
//  describe(`update testcase`, () => {
//    it(`should update testcase document`,async() => {
//      await updateDocument('user@simnovus.com_testcases',testCaseSchema,{testcaseName:'testcase0'},'status','running').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//    it(`should update testcase editHistory subdocument`,async() => {
//      await updateSubDocument('user@simnovus.com_testcases',testCaseSchema,{'testcaseName':'testcase1','editHistory.time':'12211'},'editHistory.$.comment','its a comment')
//      .then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//    it(`should update testcase executionHistory document`,async() => {
//      await updateSubDocument('user@simnovus.com_testcases',testCaseSchema,{'testcaseName':'testcase0','executionHistory.time':'12345'},'executionHistory.$.remarks','remark').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//    it(`should update testcase executionSchedule document`,async() => {
//      await updateSubDocument('user@simnovus.com_testcases',testCaseSchema,{'testcaseName':'testcase0','executionSchedule.time':'12345'},'executionSchedule.$.frequency','2MZ').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//  })

//  describe(`update usergroup`, () => {
//    it(`should update usergroup document`,async() => {
//      await updateDocument('usergroups',userGroupsSchema,{groupName:'group0'},'groupRole','creator').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//  })

//  describe(`update uesim`, () => {
//    it(`should update uesim document`,async() => {
//      await updateDocument('uesims',ueSimSchema,{ueSimId:1},'status','running').then((res)=>{
//       expect(res).is.equal(true)
//      })
//    })
//  })
// })

// describe('Delete',()=>{
//   describe(`Delete User`, () => {
//     it(`should Delete user logSettings subdocument`,async() => {
//       await deleteSubDocument('user@simnovus.coms',{email:'user@simnovus.com'},'logSettings',{'logProfileName':'profile1'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })
//     it(`should Delete user session subdocument`,async() => {
//       await deleteSubDocument('user@simnovus.coms',{email:'user@simnovus.com'},'session',{'login':'2022-01-01'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })
//     it(`should Delete user document`,async() => {
//       await deleteDocument('user@simnovus.coms',{email:'user@simnovus.com'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })
//   })
//   describe(`Delete testcase`, () => {
//     it(`should delete executionHistory subdocument`,async() => {
//       await deleteSubDocument('user@simnovus.com_testcases',{testcaseName:'testcase2'},'executionHistory',{time:'12345'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })

//     it(`should delete editHistory subdocument`,async() => {
//       await deleteSubDocument('user@simnovus.com_testcases',{testcaseName:'testcase2'},'editHistory',{time:'1221122'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })

//     it(`should delete executionSchedule subdocument`,async() => {
//       await deleteSubDocument('user@simnovus.com_testcases',{testcaseName:'testcase2'},'executionSchedule',{time:'12332453'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })

//     it(`should delete testcase document`,async() => {
//       await deleteDocument('user@simnovus.com_testcases',{testcaseName:'testcase2'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })
//   })

//   describe(`Delete usergroup`, () => {
//     it(`should Delete usergroup document`,async() => {
//       await deleteDocument('usergroups',{groupName:'groupname'}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })
//   })

//   describe(`Delete uesim`, () => {
//     it(`should Delete uesim document`,async() => {
//       await deleteDocument('uesims',{ueSimId:1}).then((res)=>{
//        expect(res).is.equal(true)
//       })
//     })
//   })
// })

