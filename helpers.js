const util = require('util')
var fs = require('fs');
const bucket = require('./config/')



/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

uploadImage = (file) => new Promise((resolve, reject) => {
  console.log("uplad image starts")
  console.log(file)
  const { originalname, buffer } = file

  console.log(originalname);
  const blob = bucket.file(originalname.replace(/ /g, "_"))
  const blobStream = blob.createWriteStream({
    resumable: false
  })

  blobStream.on('finish', () => {
    console.log("finish blob stream on")
    console.log(bucket.name)
    console.log(blob.name)
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    console.log(publicUrl)
    resolve(publicUrl)
    console.log(publicUrl)
  })
  .on('error', (err) => {
    console.log(err)
    reject(`Unable to upload image, something went wrong`)
  })
  .end(buffer)
})

module.exports=uploadImage;