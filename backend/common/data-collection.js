'use strict';
const system = require('system-commands');
const shellParser = require('node-shell-parser');
const si = require('systeminformation');

let dataCollectionFunctions = {
    returnSystemInfo: returnSystemInfo
}

// let data = { node_app_start_time : new Date(),lte_process_id: '',cpu_lte:'',mem_lte:'',cpu_info:{},sys_time_info:{},cpu_temp:{},cpu_speed:{},cpu_mem:{},lte_process_info:{},os_info:{},motherboard_info:{}}
// setInterval(()=>{
//     system(`ps -eaf | grep "[l]teue" | awk '{ print $2 }'`).then((value)=>{
//         data['lte_process_id'] = value;
//         system('ps -p '+ value+' -o %cpu,%mem').then((value1)=>{
//             data['cpu_lte'] = shellParser(value1)[0]['%CPU'];
//             data['mem_lte'] = shellParser(value1)[0]['%MEM'];
//         }).catch(e=>{
//             console.log(e);
//         })
//     }).catch(e=>{
//         console.log(e);
//     }).then(()=>{
//         si.cpu()
//         .then(cpuData => {
//             data.cpu_info = cpuData;
//         })
//         .catch(error => console.error(error)).then(()=>{
//             si.cpuTemperature().then(value=>{
//                 data.cpu_temp = value
//             }).catch(e=>{
//                 console.log(e);

//             }).then(()=>{
//                 si.cpuCurrentspeed().then(cpuSpeed=>{
//                     data.cpu_speed = cpuSpeed;

//                 }).catch(e=>{
//                     console.log(e);

//                 }).then(()=>{
//                     si.mem((memData)=>{
//                         data.cpu_mem = memData;
//                         // console.log(data);
//                     }).catch(e=>console.log(e))
//                     .then(()=>{
//                         si.processes((processes)=>{
//                             data.lte_process_info = processes.list[processes.list.map(item => item.pid).indexOf(parseInt(data.lte_process_id))];
//                         }).catch(e=>console.log(e))
//                         .then(()=>{
//                             // console.log(data);
//                             si.osInfo((os_info)=>{
//                                 data.os_info = os_info;
//                                 console.log(data);
//                             }).catch(e=>{
//                                 console.log(e);

//                             })
//                             .then(()=>{
//                                 si.baseboard((motherboard_info)=>{
//                                     data.motherboard_info = motherboard_info;
//                                 })
//                                 .catch(e=>{
//                                     console.log(e);
//                                 })

//                             })
//                         })
//                     }).catch(e=>console.log(e));
//                 })
//             }).catch(e=>console.log(e));
//         }).catch(e=>console.log(e));
//     }).catch(e=>console.log(e));
// },5000);


//Generating and returning the system information
function returnSystemInfo() {
    return new Promise(async (resolve, reject) => {
        try {
            let data = { node_app_start_time: new Date(), lte_process_id: '', cpu_lte: '', mem_lte: '', cpu_info: {}, sys_time_info: {}, cpu_temp: {}, cpu_speed: {}, ram_info: {}, lte_process_info: {}, os_info: {}, motherboard_info: {} }
            system(`ps -eaf | grep "[l]teue" | awk '{ print $2 }'`).then((value) => {
                data['lte_process_id'] = value;
		    //Sanjib
                    data['cpu_lte'] = "15";
                    data['mem_lte'] = "25";
		    /*
                system('ps -p ' + value + ' -o %cpu,%mem').then((value1) => {
                    data['cpu_lte'] = shellParser(value1)[0]['%CPU'];
                    data['mem_lte'] = shellParser(value1)[0]['%MEM'];
                }).catch(e => {
                    console.log(e);
                })
		    */
            }).catch(e => {
                console.log(e);
            }).then(() => {
                si.cpu()
                    .then(cpuData => {
                        data.cpu_info = cpuData;
                    })
                    .catch(error => console.error(error)).then(() => {
                        si.cpuTemperature().then(value => {
                            data.cpu_temp = value
                        }).catch(e => {
                            console.log(e);

                        }).then(() => {
                            si.currentLoad().then(cpuSpeed => {
                                data.cpu_speed = cpuSpeed;

                            }).catch(e => {
                                console.log(e);

                            }).then(() => {
                                si.mem((memData) => {
                                    data.ram_info = memData;
                                    // console.log(data);
                                }).catch(e => {
                                    console.log(e);
                                })
                                    .then(() => {
                                        si.processes((processes) => {
                                            data.lte_process_info = processes.list[processes.list.map(item => item.pid).indexOf(parseInt(data.lte_process_id))];
                                            if (data.lte_process_info == undefined) {
                                                data.lte_process_info = {};
                                            }
                                        }).catch(e => {
                                            console.log(e);
                                        })
                                            .then(() => {
                                                // console.log(data);
                                                // resolve({success: true,data: data});
                                                si.osInfo((os_info) => {
                                                    data.os_info = os_info;
                                                    // console.log(data);
                                                }).catch(e => {
                                                    console.log(e);

                                                })
                                                    .then(() => {
                                                        si.baseboard((motherboard_info) => {
                                                            data.motherboard_info = motherboard_info;
                                                            resolve({ success: true, data: data });
                                                        })
                                                            .catch(e => {
                                                                console.log(e);
                                                            })
                                                        // .then(()=>{
                                                        //     // si.
                                                        // })
                                                    })
                                            })
                                    }).catch(e => {
                                        console.log(e);
                                    });
                            })
                        }).catch(e => {
                            console.log(e);
                        });
                    }).catch(e => {
                        console.log(e);
                    });
            }).catch(e => {
                console.log(e);
            });


            // system(`ps -eaf | grep "[l]teue" | awk '{ print $2 }'`).then((value)=>{
            //     data['lte_process_id'] = value;
            //     system('ps -p '+ value+' -o %cpu,%mem').then((value1)=>{
            //         data['cpu_lte'] = shellParser(value1)[0]['%CPU'];
            //         data['mem_lte'] = shellParser(value1)[0]['%MEM'];
            //     }).catch(e=>{
            //         console.log(e);
            //     })
            // }).catch(e=>{
            //     console.log(e);
            // }).then(()=>{
            //     si.currentLoad().then(cpuSpeed=>{
            //         data.cpu_speed = cpuSpeed;
            //     }).catch(e=>{
            //         console.log(e);
            //     }).then(()=>{
            //         si.mem((memData)=>{
            //             data.ram_info = memData;
            //             // console.log(data);
            //         }).catch(e=>{
            //             console.log(e);
            //         })
            //         .then(()=>{
            //             si.processes((processes)=>{
            //                 data.lte_process_info = processes.list[processes.list.map(item => item.pid).indexOf(parseInt(data.lte_process_id))];
            //                 if(data.lte_process_info == undefined){
            //                     data.lte_process_info = {};
            //                 }
            //             }).catch(e=>{
            //             console.log(e);
            //             })
            //             .then(()=>{
            //                 si.cpuTemperature().then(value=>{
            //                     data.cpu_temp = value
            //                     resolve({success: true,data: data});
            //                 }).catch(e=>{
            //                     console.log(e);
            //                 })
            //             })
            //             .catch(e=>{
            //                 console.log(e);

            //             })
            //         }).catch(e=>{
            //             console.log(e);
            //         });
            //     }).catch(e=>{
            //         console.log(e);
            //     })
            // }).catch(e=>{
            //     console.log(e);
            // });
        }
        catch (e) {
            resolve({ success: false, message: e });
        }
    })
}

module.exports = dataCollectionFunctions;





