const express = require('express');
const app = express();
const server = 5000;
var bodyParser = require("body-parser");
var multer  = require('multer');


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/covidData.html");
});

app.post("/", function(req, res) {
});

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})