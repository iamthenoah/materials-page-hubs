const escapeHTML = require('escape-html')
const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))

app.get(/.*/, (_req, res) => {
    res.render(__dirname + 'public/index.html')
})

const port = 8080 ?? process.env.PORT
app.listen(port, () => {
    console.log(`--> App running @ http://localhost:${port}/`)
})