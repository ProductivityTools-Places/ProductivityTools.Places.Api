//// const { application } = require('express')
const express = require('express')
var cors = require('cors')

//image
const { format } = require('util');
const Multer = require('multer');
const bucket = require('./Config/')

const bodyParser = require('body-parser')
const app = express()
app.use(express.json())
app.use(cors())

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

var firebaseApp = undefined;
if (process.env.NODE_ENV == 'development') {
  console.log("Dev environment")
  const serviceAccount = require("d:/Bitbucket/all.configuration/ptplacesdev-serviceaccount.json");
  firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}
else {
  console.log("prod environment")
  firebaseApp = initializeApp({
    credential: applicationDefault()
  });
}

const db = getFirestore();

//image
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
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
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
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
  res.json(element);
})

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


// app.post("/Visit", (req,res)=>{
//   console.log(req.body.comment);
// })

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
