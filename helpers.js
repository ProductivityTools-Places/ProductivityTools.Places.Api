// const util = require('util')
// var fs = require('fs');
// const bucket = require('./Config/')



// /**
//  *
//  * @param { File } object file object that will be uploaded
//  * @description - This function does the following
//  * - It uploads a file to the image bucket on Google Cloud
//  * - It accepts an object as an argument with the
//  *   "originalname" and "buffer" as keys
//  */

// uploadImage = (file) => new Promise((resolve, reject) => {
 
//   const { originalname, buffer } = file
//   const blob = bucket.file(originalname);
//   const blobStream = blob.createWriteStream()

//   blobStream.on('finish', () => {
//     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
//     resolve(publicUrl)
//   })
//   .on('error', (err) => {
//     reject(`Unable to upload image, something went wrong`)
//   })
//   .end(buffer)
// })

// module.exports=uploadImage;