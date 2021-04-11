const express = require('express');

const app = express();

var path = require("path")

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/', (req,res) => {
    res.send("Hello World");
});




app.listen(3000)