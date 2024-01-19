const Cloud = require('@google-cloud/storage')
const path = require('path')
const prodServiceKey = path.join("d:\\GitHub\\Home.Configuration\\ptplacesprod-storage-serviceaccount.json")
const devServiceKey = path.join("d:\\GitHub\\Home.Configuration\\ptplacesdev-storage-serviceaccount.json")

let projectName = 'none'
let bucketName='none'
let serviceKey='none';

const {Storage} = require('@google-cloud/storage');
let storage=undefined;

if (process.env.NODE_ENV == 'development') {
  console.log("development in the project name")
  projectName = 'ptplacesdev'
  bucketName='placesdevvisits'
  serviceKey=devServiceKey

  storage = new Storage({
    keyFilename: serviceKey,
    projectId: projectName,
  })
}
else {
  console.log("prod in the project name")
  projectName = 'ptplacesprod'
  bucketName='placesprodvisits'
  storage=new Storage();
}


const bucket = storage.bucket(bucketName) // should be your bucket name

module.exports = bucket