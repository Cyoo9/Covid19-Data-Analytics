const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;

var bodyParser = require("body-parser");
var multer  = require('multer');
var csvFileName = "time_series_covid_19_confirmed_US.csv"; //just testing the function
var csv = fs.readFileSync(csvFileName); 
var List = require("collections/list"); //used for csv after array
var list = new List([])

function csvParser(csv){

  var lines=csv.toString().split("\n");

  var result = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline = lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }
	  result.push(obj);
  }
  
  let json = JSON.stringify(result); //JSON
  fs.writeFileSync('output.json', json); 
}

csvParser(csv);

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