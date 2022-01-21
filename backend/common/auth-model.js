const loginModel = require('./../models/userModel');
const commonFunctions = require('./../common/commonFunctions');

var authModel = {
    getUsers: getUsers,
    blockUser: blockUser,
    editUser: editUser,
    deleteUser: deleteUser,
}

function getUsers() {
    return new Promise(async (resolve, reject) => {
        try {
            loginModel.find({}).sort({ updatedAt: -1 }).sort({ field: -1 }).then((response, err) => {
                if (err) {
                    res.json({ success: true, status: 200, data: err });
                    reject(err)
                }
                else {
                    try {
                        let arr = [];
                        let i = 0;
                        while (i < response.length) {
                            let temp = { userName: response[i].userName, emailAddress: response[i].emailAddress, password: response[i].password, user_type: response[i].user_type, userRole: response[i].userRole, createdBy: response[i].createdBy, lastLogin: new Date(), sQues1: response[i].sQues1, sAns1: response[i].sAns1, sQues2: response[i].sQues2, sAns2: response[i].sAns2, status: response[i].status, _id: response[i]._id }
                            // let temp = {
                            //     createdAt: response[i].createdAt,
                            //     createdBy: response[i].createdBy,
                            //     email: response[i].email,
                            //     lastLogin: response[i].lastLogin,
                            //     name: response[i].name,
                            //     updatedAt: response[i].updatedAt,
                            //     user_type: response[i].user_type,
                            //     _id: response[i]._id,
                            //     dir_size: response[i].dir_size,
                            //     password: response[i].password,
                            //     status: response[i].status
                            // }

                            commonFunctions.getUserDirSize('./dir/' + response[i].emailAddress).then(async (res) => {
                                try {
                                    loginModel.findByIdAndUpdate(response[i]._id, { $set: { dir_size: res } }).then(async (res1, err) => {
                                    })
                                }
                                catch (e) {
                                    resolve(e)
                                }

                            });
                            arr.push(temp);
                            i++;
                        }
                        resolve(arr);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            })
        }
        catch (e) {
            reject(e);
        }
    })
}

function blockUser(req, res) {
    return new Promise(async (resolve, reject) => {
        loginModel.findByIdAndUpdate(req.body['_id'], { status: req.body['status'] }, (err, res) => {
            if (err) {
                resolve(err);
            }
            else {
                resolve(res);
            }
        })
    })
}

function deleteUser(req, res) {
    return new Promise(async (resolve, reject) => {
        loginModel.findByIdAndRemove(req.body['_id'], (err, res) => {
            if (err) {
                resolve(err);
            }
            else {
                resolve(res);
            }
        })
    })
}

function editUser(req, res) {
    /** Changing user information as per information provided */
    return new Promise(async (resolve, reject) => {
        if(req.body){
            loginModel.findByIdAndUpdate(req.body['_id'], req.body, (err, res) => {
                if (err) {
                    resolve(err);
                }
                else {
                    resolve(res);
                }
            })
        }
        else{
            reject({message: "Data not provided"})
        }
    })
}

module.exports = authModel;
