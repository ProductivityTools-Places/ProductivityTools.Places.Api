const { application } = require('express')
const express = require('express')
var cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require("d:/Bitbucket/all.configuration/ptplacesprod-serviceaccount.json");
// const { AppStore } = require('firebase-admin/lib/app/lifecycle')

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.get("/Date", (req, res) => {
  console.log("request date")
  res.send(new Date().toString());
})

app.get("/PlaceList", async (req, res) => {
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
  res.send("Wooho")
})

app.post("/NewPlace", (req, res) => {
  console.log(req.body);
  console.log(req.body.name)
  const docRef = db.collection('Places').add({
    name: req.body.name
  })

  res.send(`Hello1 `);
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
