const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require('path');
let ejs = require('ejs');

var bodyParser = require("body-parser");
var multer  = require('multer');
var csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv')); //reads in a cvs file
var result = [];
let searched_results = [];

//parses a cvs file into an array
function csvParser(csv){

  var lines=csv.toString().split("\r\n"); //split cvs file into readable lines of data by endlines
  var headers=lines[0].split(","); //split the first line into object variable names

  //goes through every line but the header line
  for(var i=1;i<lines.length;i++){

	  var obj = {}; //create new object to be added to the array
	  var currentline = lines[i].split(","); //split the current line into object variable values

    if(headers.length < currentline.length) {
      var combinedLines = currentline[2] + ',' + currentline[3];
      var removeQuotes = combinedLines.split("\"");
      currentline[2] = removeQuotes[1];
      currentline[3] = currentline[4];
      currentline[4] = currentline[5];
      currentline[5] = currentline[6];
      currentline[6] = currentline[7];
      currentline[7] = currentline[8];
    }

    //for each variable name in header, assign the value from that line
	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj); //push newly created object on to array
  }
}

csvParser(csv);

//Reformats dates from something like 12/19/2020 to 2020-12-19
function ReformatDate(old_date) {

  if (old_date.length == 10) {
    return `${old_date.substr(6, 4)}-${old_date.substr(0, 2)}-${old_date.substr(3, 2)}`;
  }
  else {
    return "Unknown Date";
  }
}

//searchs an array for specific object values
function search(req, res, next) {
  
  searched_results = []; //reset array to empty
  
  //loops through all the arrays objects
  for(var i = 0; i < result.length; i++) {

    //checks if country, state, and date match, accepts all if one or more is left blank
    if(result[i]['Country/Region'] == req.body.country || req.body.country == '') {
      if(result[i]['Province/State'] == req.body.state || req.body.state == '') {
        if(req.body.date == '' || ReformatDate(result[i]['ObservationDate']) == req.body.date) {
          if(parseInt(result[i]['Confirmed']) >= parseInt(req.body.Confirmed)) {
            if(parseInt(result[i]['Deaths']) >= parseInt(req.body.Deaths)) {
              if(parseInt(result[i]['Recovered']) >= parseInt(req.body.Recovered)) {
                searched_results.push(result[i]);
              }
            }
          }
        }
      }
    }
  }
  next();
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidData.html"));
});

app.get('/output.json', (req, res) => {
  console.log('xd');  //??
  res.send("XDDDDD");  //??
  //res.sendFile(path.join(__dirname, "/public" , "output.json"));
});

app.use(express.urlencoded({
  extended: true
}))

//calls the middlewear function "search" after the client posts a request
app.post('/', search,  (req, res) => {

  /*console.log(req.body);

  console.log(searched_results.length);
  for (let i = 0; i < searched_results.length; ++i) {
    console.log(`${i}: ${JSON.stringify(searched_results[i])}`);
  } */
  
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end

  res.sendFile(path.join(__dirname, "/public" , "output.json"));
  //res.end();
});

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})