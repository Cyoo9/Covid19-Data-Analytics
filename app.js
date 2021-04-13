const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;

var bodyParser = require("body-parser");
var multer  = require('multer');
var csvFileName = "time_series_covid_19_confirmed_US.csv"; //just testing the function
var List = require("collections/list"); //used for csv after array
var list = new List([])

function csvParser(csvFileName) {
  var csv = fs.readFileSync(csvFileName);
  var array = csv.toString().split("\r");

  let result = [];
  let headers = array[0].split(", ");

  for (let i = 1; i < array.length - 1; i++) {
    let obj = {}
    let str = array[i]
    let s = ''
    let flag = 0

    for (let ch of str) {
      if (ch === '"' && flag === 0) {
        flag = 1
      }
      else if (ch === '"' && flag == 1) flag = 0
      if (ch === ', ' && flag === 0) ch = '|'
      if (ch !== '"') s += ch
    }
  
    let properties = s.split("|")

    for (let j in headers) {
      if (properties[j].includes(", ")) {
        obj[headers[j]] = properties[j]
          .split(", ").map(item => item.trim())
      }
      else obj[headers[j]] = properties[j]
    }
    result.push(obj);
  }

  let json = JSON.stringify(result);
  fs.writeFileSync('output.json', json);
}

csvParser(csvFileName);

/* app.use(express.urlencoded({
  extended: true
}))

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/covidData.html");
});

app.post("/", function(req, res) {
});

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
}) */