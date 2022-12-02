const Cloud = require('@google-cloud/storage')
const path = require('path')
//const serviceKey = path.join("d:\\Bitbucket\\all.configuration\\ptplacesprod-storage-serviceaccount.json")
const serviceKey = path.join("d:\\Bitbucket\\all.configuration\\ptplacesdev-serviceaccount.json")

let bucketName = 'none'
const { Storage } = Cloud
if (process.env.NODE_ENV == 'development') {
  bucketName = 'ptplacesprod'
}
else {
  bucketName = placesdevvisits
}
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: bucketName,
})

module.exports = storage