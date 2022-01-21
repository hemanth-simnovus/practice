const mongoose = require("mongoose");


module.exports = {
  userObj: [
    {
      email: "user@simnovus.com",
      fullName: "Simnovus bangalore",
      userName: "SimnovusUser32",
      password: "Simnovus@123",
      userRole: "admin",
    },
    {
      email: "user@simnovus.com",
      fullName: "Simnovus bangalore",
      userName: "SimnovusUser32",
      password: "Simnovus@123",
      userRole: "admin",
    },
  ],
  users:[
    {
      email: "user0@simnovus.com",
      fullName: "Simnovus bangalore",
      userName: "SimnovuS",
      password: "Simnovus@123",
      userRole: "admin",
    },{
      email: "user1@simnovus.com",
      fullName: "Simnovus bangalore",
      userName: "SimnovusUser01",
      password: "Simnovus@123",
      userRole: "creator",
    },{
      email: "user2@simnovus.com",
      fullName: "Simnovus bangalore",
      userName: "SimnovusUser02",
      password: "Simnovus@123",
      userRole: "both",
    },
  ],
  LogSettingSubDocument: [
    {
      logProfileName: "profile0",
      settings: {
        sip: "info",
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
    },
    {
      logProfileName: "profile1",
        settings: {
          sip: "info",
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
    },
    {
      logProfileName: "profile1",
      settings: {
        sip: "info",
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
  },
  ],
  SessionObj : [
    {
      login : new Date("2022-01-01"),
      logout:Date.now()
    },
    {
      login : Date.now(),
      logout:Date.now()
    }
  ],
  testcaseObj: [
    {
      testcaseName: "testcase0",
      editHistory: [
        {
          time: "1221122",
          comment: "comment",
        },
      ],
      executionSchedule: [
        {
          time: "12332453",
          ueSimID: 0,
        },
      ],
      intermediateObject: {
        tags: ["tag"],
        description: "description",
        cellConfig: {
          master: {},
          cells: [{}],
        },
        subsConfig: {
          master: {},
          subs: [{}],
        },
        userplaneConfig: {
          master: {},
          profiles: [{}],
        },
        powerCycleConfig: {
          master: {},
          profiles: [{}],
        },
        mobilityConfig: {
          master: {},
          profiles: [{}],
        },
        loggingConfig: {
          layer: {},
          displayCrpto: true,
          displaySecurity: true,
          saveSignal: true,
        },
        stopConfig: {},
      },
      createdAt: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "testcase1",
      status: "running",
      executionHistory: [],
      editHistory: [
        {
          time: "12211",
          comment: "comment",
        },
      ],
      executionSchedule: [
        {
          time: "12332453",
          ueSimID: 0,
        },
      ],
      intermediateObject: {
        tags: ["tag"],
        description: "description",
        cellConfig: {
          master: {},
          cells: [{}],
        },
        subsConfig: {
          master: {},
          subs: [{}],
        },
        userplaneConfig: {
          master: {},
          profiles: [{}],
        },
        powerCycleConfig: {
          master: {},
          profiles: [{}],
        },
        mobilityConfig: {
          master: {},
          profiles: [{}],
        },
        loggingConfig: {
          layer: {},
          displayCrpto: true,
          displaySecurity: true,
          saveSignal: true,
        },
        stopConfig: {},
      },
      createdAt: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "testcase2",
      status: "running",
      executionHistory: [],
      editHistory: [
        {
          time: "122112",
          comment: "comment",
        },
      ],
      executionSchedule: [
        {
          time: "12332453",
          ueSimID: 0,
        },
      ],
      intermediateObject: {
        tags: ["tag"],
        description: "description",
        cellConfig: {
          master: {},
          cells: [{}],
        },
        subsConfig: {
          master: {},
          subs: [{}],
        },
        userplaneConfig: {
          master: {},
          profiles: [{}],
        },
        powerCycleConfig: {
          master: {},
          profiles: [{}],
        },
        mobilityConfig: {
          master: {},
          profiles: [{}],
        },
        loggingConfig: {
          layer: {},
          displayCrpto: true,
          displaySecurity: true,
          saveSignal: true,
        },
        stopConfig: {},
      },
      createdAt: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "testcase0",
      status: "running",
      executionHistory: [],
      editHistory: [
        {
          time: "1221122",
          comment: "comment",
        },
      ],
      executionSchedule: [
        {
          time: "12332453",
          ueSimID: 0,
        },
      ],
      intermediateObject: {
        tags: ["tag"],
        description: "description",
        cellConfig: {
          master: {},
          cells: [{}],
        },
        subsConfig: {
          master: {},
          subs: [{}],
        },
        userplaneConfig: {
          master: {},
          profiles: [{}],
        },
        powerCycleConfig: {
          master: {},
          profiles: [{}],
        },
        mobilityConfig: {
          master: {},
          profiles: [{}],
        },
        loggingConfig: {
          layer: {},
          displayCrpto: true,
          displaySecurity: true,
          saveSignal: true,
        },
        stopConfig: {},
      },
      createdAt: new Date().toISOString().split("T")[0],
    },
  ],
  executionHistory: [
    {
      time: '12345', 
      result: 'ok',
      duration: 1000,
      remarks: 'this is a remark', 
    },
    {
      time: '123', 
      result: 'ok',
      duration: 100,
      remarks: 'this is another remark', 
    },
  ],
  editHistory: [
    {
      time: '12345',
      comment: 'this is comment',
    },
    {
      time: '123',
      comment: 'this is another comment',
    }
  ],
  executionSchedule: [
    {
      time: '12345',
      ueSimID:1,
      frequency :'1MHZ'
    },
    {
      time: '123',
      ueSimID:0,
      frequency :'2MHZ'
    }
  ],
  usergroupObj: [
    {
      userGroupId: new mongoose.Types.ObjectId(),
      groupName: "Group0",
      groupRole: "admin",
      createdDate: new Date().toISOString().split("T")[0],
    },
    {
      userGroupId: new mongoose.Types.ObjectId(),
      groupRole: "admin",
      createdDate: new Date().toISOString().split("T")[0],
    },
  ],
  uesim: [
    {
      ueSimId: 1,
      IP: "0.0.0.0",
      host: "host",
      userName: "username1",
      password: "simnovus",
      ueInfo: {
        software: {
          ueVersion: "ue",
          os: {
            distribution: "{type: String, required: true}",
            version: "{type: String, required: true}",
            kernel: "{type: String, required: true}",
          },
          license: {
            type: "fixed",
            expiryDate: Date.now(),
            noOfUes: 1,
            ratType: 2,
          },
        },
        hardware: {
          board: {
            manufacturer: "{type: String, required: true}",
            productName: "{type: String, required: true}",
          },
          cpu: {
            manufacturer: "Intel",
            family: "{type: String, required: true}",
            version: "{type: String, required: true}",
            speed: "{type: String, required: true}",
            cores: 18,
            threadsPerCore: 2,
          },
          memory: {
            total: 1080,
            used: 200,
            available: 808,
          },
          rf: [
            {
              boardID: "{type: String, required: true}",
              deviceName: "{type: String, required: true}",
              versionSW: "{type: String, required: true}",
              versionFPGA: "{type: String, required: true}",
            },
          ],
        },
      },
    },
    {
      ueSimId: 2,
      IP: "0.0.0.0",
      host: "host",
      userName: "username1",
      password: "simnovus",
      ueInfo: {
        software: {
          ueVersion: "ue",
          os: {
            distribution: "{type: String, required: true}",
            version: "{type: String, required: true}",
            kernel: "{type: String, required: true}",
          },
          license: {
            type: "fixed",
            expiryDate: Date.now(),
            noOfUes: 1,
            ratType: 2,
          },
        },
        hardware: {
          board: {
            manufacturer: "{type: String, required: true}",
            productName: "{type: String, required: true}",
          },
          cpu: {
            manufacturer: "Intel",
            family: "{type: String, required: true}",
            version: "{type: String, required: true}",
            speed: "{type: String, required: true}",
            cores: 18,
            threadsPerCore: 2,
          },
          memory: {
            total: 1080,
            used: 200,
            available: 808,
          },
          rf: [
            {
              boardID: "{type: String, required: true}",
              deviceName: "{type: String, required: true}",
              versionSW: "{type: String, required: true}",
              versionFPGA: "{type: String, required: true}",
            },
          ],
        },
      },
    },
  ],
  logs: [
    {
      testcaseName: "test0",
      ueSimId: 1,
      message: {}, //type json changed to string
      logs: {}, //type json changed to string
      message_id: 000,
      arrivalDate: new Date(2022, 0, 1).toISOString().split("T")[0],
      expiryDate: new Date(2023, 0, 1).toISOString().split("T")[0],
    },
    {
      testcaseName: "test1",
      ueSimId: 1,
      message: {}, //type json changed to string
      logs: {}, //type json changed to string
      message_id: 000,
      arrivalDate: new Date(2022 - 00 - 03).toISOString().split("T")[0],
      expiryDate: new Date(2023 - 00 - 03).toISOString().split("T")[0],
    },
    {
      testcaseName: "test0",
      ueSimId: 2,
      message: {}, //type json changed to string
      logs: {}, //type json changed to string
      message_id: 000,
      arrivalDate: new Date(2022 - 00 - 03).toISOString().split("T")[0],
      expiryDate: new Date(2023 - 00 - 03).toISOString().split("T")[0],
    },
    {
      testcaseName: "test2",
      ueSimId: 2,
      message: {}, //type json changed to string
      logs: {}, //type json changed to string
      message_id: 000,
      arrivalDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "test3",
      ueSimId: 1,
      message: {}, //type json changed to string
      logs: {}, //type json changed to string
      message_id: 000,
      arrivalDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date().toISOString().split("T")[0],
    },
  ],
  stats: [
    {
      testcaseName: "test0",
      ueSimId: 1,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      global: {
        cells: {
          throughput: {},
          packets: {},
          mcs: {},
        },
        messages: {},
      },
      message_id: {},
      arrivalDate: new Date(2022 - 00 - 03).toISOString().split("T")[0],
    },
    {
      testcaseName: "test1",
      ueSimId: 1,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      global: {
        cells: {
          throughput: {},
          packets: {},
          mcs: {},
        },
        messages: {},
      },
      message_id: {},
      arrivalDate: new Date(2022 - 00 - 03).toISOString().split("T")[0],
    },
    {
      testcaseName: "test0",
      ueSimId: 2,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      global: {
        cells: {
          throughput: {},
          packets: {},
          mcs: {},
        },
        messages: {},
      },
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "test0",
      ueSimId: 2,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      global: {
        cells: {
          throughput: {},
          packets: {},
          mcs: {},
        },
        messages: {},
      },
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "test0",
      ueSimId: 2,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      global: {
        cells: {
          throughput: {},
          packets: {},
          mcs: {},
        },
        messages: {},
      },
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
  ],
  uestats: [
    {
      testcaseName: "test1",
      ueSimId: 1,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      message_id: {},
      arrivalDate: new Date(2022 - 00 - 03).toISOString().split("T")[0],
    },
    {
      testcaseName: "test2",
      ueSimId: 1,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "test3",
      ueSimId: 2,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "test4",
      ueSimId: 2,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
    {
      testcaseName: "test5",
      ueSimId: 2,
      message: {},
      time: {},
      cpu: {},
      instance_id: {},
      message_id: {},
      arrivalDate: new Date().toISOString().split("T")[0],
    },
  ],
};