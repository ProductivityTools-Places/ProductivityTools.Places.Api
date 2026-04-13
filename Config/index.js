const Cloud = require('@google-cloud/storage')
const path = require('path')
const isWin = process.platform === 'win32';
const baseConfigPath = isWin ? "d:/GitHub/Home.Configuration" : "/usr/local/google/home/pwujczyk/github/Home.Configuration";

const firebasePaths = {
  dev: path.join(baseConfigPath, "PTProjectsDev.Firebase.ServiceAccount.json"),
  prod: path.join(baseConfigPath, "PTProjectsWeb.Firebase.ServiceAccount.json"),
  fallback: path.join(baseConfigPath, "PTProjectsWeb.Firebase.ServiceAccount.json")
};

const storagePaths = {
  dev: path.join(baseConfigPath, "ptplacesdev-storage-serviceaccount.json"),
  prod: path.join(baseConfigPath, "ptplacesprod-storage-serviceaccount.json")
};

let projectName = 'none'
let bucketName='none'
let serviceKey='none';

const {Storage} = require('@google-cloud/storage');
let storage=undefined;
console.log("NODE_ENV: ", process.env.NODE_ENV);
if (process.env.NODE_ENV == 'development') {
  console.log("development in the project name")
  projectName = 'ptprojectsdev'
  bucketName = 'ptprojects-placesdevvisits'
  serviceKey = firebasePaths.dev

  storage = new Storage({
    keyFilename: serviceKey,
    projectId: projectName,
  })
}
else {
  console.log("prod in the project name")
  projectName = 'ptprojectsweb'
  bucketName = 'ptprojects-placesprodvisits'

  const isWin = process.platform === 'win32';
  if (!isWin && !process.env.GAE_SERVICE) {
    console.log("Running locally on Linux, using service account file for Storage");
    storage = new Storage({
      keyFilename: firebasePaths.prod,
      projectId: projectName
    });
  } else {
    storage = new Storage();
  }
}


const bucket = storage.bucket(bucketName) // should be your bucket name
const imagePrefix = `https://storage.googleapis.com/${bucketName}/`;

module.exports = {
  bucket,
  firebasePaths,
  imagePrefix
}