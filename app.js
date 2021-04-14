const express = require('express');
const app = express();
const server = 5000;
var bodyParser = require("body-parser");
var multer  = require('multer');
const csv = require('csv-parser')
const fs = require('fs')
const results = [];

//this works like a charm; i moved the csv file outside the folder bc i didnt know how to locate it
fs.createReadStream('covid_19_data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results);
  });


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/covidData.html");
});

app.post("/", function(req, res) {

});

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})