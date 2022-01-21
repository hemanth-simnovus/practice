const fs = require('fs');
const path = require('path')
const mongoose = require('mongoose');
const testCaseModel = require('../models/testCaseModel');

//IMPORT DATA INTO DB
const importData = async (allProfileData) => {
  try {
    await testCaseModel.create(allProfileData);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await testCaseModel.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const db="mongodb://localhost:27017/simulator_v1?compressors=zlib";
mongoose.connect(
    db, {useNewUrlParser:true,
    useCreateIndex:true,
useFindAndModify:false,
useUnifiedTopology:true}
,async(err, conn) => {
    if (err) {
        //console.log(err); 
       await console.log("connection not sucessfull");
        process.exit()        
    }
    else{
       await console.log("connection sucessfull");

       if (process.argv[2] === '--import') {
           if (!(process.argv[3])) {
               await console.log("Please provide JSON file");
               process.exit() 
           } else {
            let inputFile =process.argv[3];
            let pathDir = '../utility/'+inputFile;

            //READ JSON FILE
            const directoryPath = path.join(__dirname, pathDir);
            
            if (fs.existsSync(directoryPath)) {
                await console.log('Found file');
                fs.readFile(directoryPath, 'utf8',async function(err, data){
                        if (err) {
                            await console.log("cannot read file");
                            process.exit() 
                        } else {
                            let allData =JSON.parse(data);
                            for (let i = 0; i < allData.length; i++) {
                                const eachObj = allData[i];
                                eachObj['profileName']=eachObj['fileName'];
                                delete eachObj['_id'];
                            }
        
                            importData(allData);
                        }               
                    });

            }else{
                await console.log("File not found");
                process.exit()
            }

           }
            
        } else if (process.argv[2] === '--delete') {
            deleteData();
        }else{
            console.log("Please valid input");
            process.exit() 
        }
        
    }
})
