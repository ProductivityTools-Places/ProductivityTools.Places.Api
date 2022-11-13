const Cloud = require('@google-cloud/storage')
const path = require('path')
const serviceKey = path.join("d:\\Bitbucket\\all.configuration\\ptplacesprod-storage-serviceaccount.json")

const { Storage } = Cloud
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'ptplacesprod',
})

module.exports = storage