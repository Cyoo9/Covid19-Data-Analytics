const express = require('express')
const path = require('path')
const app = express()
const port = 3200

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
    const options = {
        root : path.join(__dirname)
    }
    
    res.sendFile('index.html', options)
  
})

app.post('/', (req, res) => {
    console.log("Request received from client")
    if (req.body["submit-btn"] === 'Hello') {
        res.send("<h1>Hello World</h1>")
    }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})