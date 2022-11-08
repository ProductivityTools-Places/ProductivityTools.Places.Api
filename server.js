const { application } = require('express')
const express = require('express')
const app = express()
app.use(express.json())

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require("d:/Bitbucket/all.configuration/ptplacesprod-serviceaccount.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.get("/", (req, res) => {
  res.send("Wooho")
})


app.post("/NewPlace", (req, res) => {
  console.log(req.body);
  console.log(req.body.name)
  const docRef = db.collection('Places').add({
      name:req.body.name
    })

  docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
  });
  res.send(`Hello1 `);
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
