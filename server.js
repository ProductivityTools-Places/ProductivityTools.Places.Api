
//// const { application } = require('express')
const express = require('express')
var cors = require('cors')

//image
const { format } = require('util');
const Multer = require('multer');
const { bucket, firebasePaths, imagePrefix } = require('./Config/')

const bodyParser = require('body-parser')
const app = express()
app.use(express.json())
app.use(cors())

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth } = require("firebase-admin/auth");
const { Firestore, Timestamp, FieldValue } = require('@google-cloud/firestore');

var firebaseApp = undefined;

if (process.env.NODE_ENV == 'development') {
  console.log("Dev environment")
  const serviceAccount = require(firebasePaths.dev);
  firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}
else {

  if (process.env.NODE_ENV == 'testingprod') {
    console.log("testing prod environment")
    const serviceAccount = require(firebasePaths.prod);
    firebaseApp = initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    console.log("prod environment")
    // If running locally on Linux and file exists, use it instead of applicationDefault
    const isWin = process.platform === 'win32';
    if (!isWin && !process.env.GAE_SERVICE) {
      console.log("Running locally on Linux, using service account file");
      const serviceAccount = require(firebasePaths.fallback);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      firebaseApp = initializeApp({
        credential: applicationDefault()
      });
    }
  }
}

let db;


if (process.env.NODE_ENV == 'development') {
  console.log("development in the db")
  db = new Firestore({
    databaseId: 'places',
    keyFilename: firebasePaths.dev
  });
} else {
  const isWin = process.platform === 'win32';
  if (!isWin && !process.env.GAE_SERVICE) {
    console.log("Using service account file for Firestore client");
    db = new Firestore({
      databaseId: 'places',
      keyFilename: firebasePaths.fallback
    });
  } else {
    db = new Firestore({
      databaseId: 'places',
      projectId: 'ptprojectsweb'
    });
  }
}


//image
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/uploads', multer.single('file'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `${imagePrefix}${blob.name}`;
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
})

app.delete('/photos/:filename', async (req, res) => {
  console.log("Delete photo request for file:", req.params.filename);
  let x = await validateToken(req);
  if (x === false) {
    res.status(401).send('Unauthorized');
    return;
  }

  const filename = req.params.filename;
  try {
    await bucket.file(filename).delete();
    res.status(200).send(`File ${filename} deleted.`);
  } catch (error) {
    console.error("Error deleting file:", error);
    if (error.code === 404) {
      res.status(404).send(`File ${filename} not found.`);
    } else {
      res.status(500).send(`Error deleting file: ${error.message}`);
    }
  }
})
//endimage




app.get("/Date", (req, res) => {
  console.log("request date");
  console.log(process.env.NODE_ENV)
  res.send(new Date().toString());
})

const validateToken = async (req) => {
  let result = false;

  if (req.headers['authorization'] != undefined) {
    const idToken = req.headers['authorization'].split(" ")[1];
    //console.log(firebaseApp);
    await getAuth(firebaseApp)
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        console.log("token OK");
        console.log(uid);
        result = true;
      })
      .catch((error) => {
        console.log("wrong token")
        console.log(error)
        result = false;
      });
  }
  console.log("return result")
  console.log(result);
  return result;
}

const enrichPlaceWithImageUrls = (element) => {
  if (element.Thumbnail && !element.Thumbnail.startsWith('http')) {
    element.Thumbnail = `${imagePrefix}${element.Thumbnail}`;
  }
  if (element.Visits && Array.isArray(element.Visits)) {
    element.Visits.forEach(visit => {
      if (visit.visitThumbnail && !visit.visitThumbnail.startsWith('http')) {
        visit.visitThumbnail = `${imagePrefix}${visit.visitThumbnail}`;
      }
      if (visit.Photos && Array.isArray(visit.Photos)) {
        visit.Photos = visit.Photos.map(photo => {
          if (typeof photo === 'string' && !photo.startsWith('http')) {
            return `${imagePrefix}${photo}`;
          }
          return photo;
        });
      }
    });
  }
  return element;
}

app.get("/PlaceList", async (req, res) => {
  console.log("Place List")
  console.log(req.headers['authorization']);
  let x = await validateToken(req);
  console.log(x);
  if (x == false) {
    res.send(401);
    return;
  }
  console.log("Token seems ok")


  const placesCollection = db.collection('Places');
  const places = await placesCollection.get();
  console.log(places)
  var result = [];
  places.forEach(doc => {
    var element = { id: doc.id }
    console.log(doc.id, '=>', doc.data())
    element = { ...element, ...doc.data() }

    element = enrichPlaceWithImageUrls(element);

    result.push(element);
  })
  res.json(result);
})

app.get("/Place", async (req, res) => {
  let id = req.query.id;
  console.log(req.query);
  console.log(id);
  const placeRef = db.collection('Places').doc(id);
  const doc = await placeRef.get();
  console.log(doc);
  var element = { id: doc.id }
  element = { ...element, ...doc.data() }
  element = enrichPlaceWithImageUrls(element);
  res.json(element);
})

app.get("/get-photos-base-url", (req, res) => {
  res.send(imagePrefix);
});

app.get("/", (req, res) => {
  res.send("Wooho1")
})

app.post("/NewPlace", async (req, res) => {
  console.log('NewPlace');
  console.log(req.body);
  console.log(req);

  const docRef = await db.collection('Places').add(req.body)
  let document = await docRef.get();
  res.send(document.id);
})

app.post("/UpdatePlace", (req, res) => {
  console.log(req.body);
  console.log(req.body.name)
  const docRef = db.collection('Places').doc(req.body.id).set(req.body)
  res.send(`Updated`);
})

app.post("/migrate-images", async (req, res) => {
  res.send("Not doing it anymore");
  return;
  console.log("Migrating images...");
  const placesCollection = db.collection('Places');
  const places = await placesCollection.get();

  let count = 0;
  const oldPrefix = 'https://storage.googleapis.com/placesprodvisits/';

  const promises = [];

  places.forEach(doc => {
    const data = doc.data();
    let updated = false;

    if (data.Thumbnail && data.Thumbnail.startsWith(oldPrefix)) {
      data.Thumbnail = data.Thumbnail.replace(oldPrefix, '');
      updated = true;
    }

    if (data.Visits && Array.isArray(data.Visits)) {
      data.Visits.forEach(visit => {
        if (visit.Photos && Array.isArray(visit.Photos)) {
          visit.Photos = visit.Photos.map(photo => {
            if (typeof photo === 'string' && photo.startsWith(oldPrefix)) {
              updated = true;
              return photo.replace(oldPrefix, '');
            }
            return photo;
          });
        }
        if (visit.visitThumbnail && visit.visitThumbnail.startsWith(oldPrefix)) {
          visit.visitThumbnail = visit.visitThumbnail.replace(oldPrefix, '');
          updated = true;
        }
      });
    }

    if (updated) {
      count++;
      promises.push(placesCollection.doc(doc.id).update(data));
    }
  });

  await Promise.all(promises);

  res.send(`Migrated ${count} documents.`);
});


// app.post("/Visit", (req,res)=>{
//   console.log(req.body.comment);
// })

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
