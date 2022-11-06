const express = require('express')
const app = express()

const port = 8082

app.get("/", (req, res) => {
    res.send("Wooho")
})

app.listen(port, () => {
    console.log(`Listen on ${port}`)
})