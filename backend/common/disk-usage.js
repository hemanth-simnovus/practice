const disk = require('diskusage');
var diskModel = {
  diskUsage: diskUsage
}
function diskUsage(req, res) {
  return new Promise(async (resolve, reject) => {
    try {
      disk.check(path, function (err, info) {
        if (err) {
          return res.send(err);
        } else {
          //   res.send({'Available Memory': info.available,'Free Memory': info.free,'Total Memory': info.total});
          resolve(info);
        }
      });
    }
    catch (e) {

    }
  })

}
module.exports = diskModel;