const express = require('express');
const app = express();
const server = 5000;
var bodyParser = require("body-parser");
var multer  = require('multer');
var List = require("collections/list"); //used for csv after array

// var list = new List([])

app.use(express.urlencoded({
  extended: true
}))

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res) {
  
});

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})