const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require ('path');


var bodyParser = require("body-parser");
var multer  = require('multer');
var csvFileName = "covid_19_data.csv"; //just testing the functions
var csv = fs.readFileSync(csvFileName); //reads in a cvs file
var result = [];

//parses a cvs file into an array
function csvParser(csv){

  var lines=csv.toString().split("\r\n"); //split cvs file into readable lines of data by endlines
  var headers=lines[0].split(","); //split the first line into object variable names

  //goes through every line but the header line
  for(var i=1;i<lines.length;i++){

	  var obj = {}; //create new object to be added to the array
	  var currentline = lines[i].split(","); //split the current line into object variable values

    //for each variable name in header, assign the value from that line
	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj); //push newly created object on to array
  }
}

csvParser(csv);

//searchs an array for specific object values
function search(req, res, next) {
 
  var search = []; //create array that will hold the objects with the correct search values

  console.log(req.body.confirmedCases);
  console.log(req.body.deaths);
  console.log(req.body.recoveries);
  console.log("APP.JS LINE 43");
  
  //loops through all the arrays objects
  for(var i = 0; i < result.length; i++) {
    //checks if country, state, and date match, accepts all if one or more is left blank
    if(result[i]['Country/Region'] == req.body.country || req.body.country == '') {
      if(result[i]['Province/State'] == req.body.state || req.body.state == '') {
        if(result[i]['ObservationDate'] == req.body.date || req.body.date == '') {
          search.push(result[i]);
        }
      }
    }
  }

  let json = JSON.stringify(search); //stringify the search array
  fs.writeFileSync('output.json', json); //store the string in a json file to be sent to front-end
  next();
}




app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.redirect("/covidData.html");
  //res.send("<h1>XDDDDDDDDDDDDDDDDDDDDDD</h1>");
});

app.get('/covidData.html', function(req, res) {
  console.log("XD");
  res.sendFile(path.join(__dirname, "../public" , "covidData.html"));
});


app.use(express.urlencoded({
  extended: true
}))

app.use(search); //middleware

app.post('/', search, (req, res) => {
  res.sendFile(__dirname + "/output.json");
});

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})