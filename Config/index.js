const Cloud = require('@google-cloud/storage')
const path = require('path')
const isWin = process.platform === 'win32';
const linuxServiceAccountPath = "/usr/local/google/home/pwujczyk/github/Home.Configuration/ProductivityTools.ProjectsWeb.Firebase.ServiceAccount.json";

const firebasePaths = {
  dev: isWin ? "d:/GitHub/Home.Configuration/ProductivityTools.ProjectsWeb.Firebase.ServiceAccount.json" : linuxServiceAccountPath,
  prod: isWin ? "d:/GitHub/Home.Configuration/ProductivityTools.ProjectsWeb.Firebase.ServiceAccount.json" : linuxServiceAccountPath,
  fallback: linuxServiceAccountPath
};

const storagePaths = {
  dev: isWin ? "d:\\GitHub\\Home.Configuration\\ptplacesdev-storage-serviceaccount.json" : linuxServiceAccountPath,
  prod: isWin ? "d:\\GitHub\\Home.Configuration\\ptplacesprod-storage-serviceaccount.json" : linuxServiceAccountPath
};

let projectName = 'none'
let bucketName='none'
let serviceKey='none';

const {Storage} = require('@google-cloud/storage');
let storage=undefined;

if (process.env.NODE_ENV == 'development') {
  console.log("development in the project name")
  projectName = 'ptprojectsweb'
  bucketName='placesdevvisits'
  serviceKey = storagePaths.dev

  storage = new Storage({
    keyFilename: serviceKey,
    projectId: projectName,
  })
}
else {
  console.log("prod in the project name")
  projectName = 'ptprojectsweb'
  bucketName='placesprodvisits'
  storage=new Storage();
}


const bucket = storage.bucket(bucketName) // should be your bucket name

module.exports = {
  bucket,
  firebasePaths
}