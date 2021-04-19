
const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require ('path');
let ejs = require('ejs');


var bodyParser = require("body-parser");
var multer  = require('multer');
var csvFileName = "covid_19_data.csv"; //just testing the functions
var csv = fs.readFileSync(csvFileName); //reads in a cvs file
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

    //for each variable name in header, assign the value from that line
	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj); //push newly created object on to array
  }
}

csvParser(csv);

function ReformatDate(old_date) {

  //Example
  //old: 12/19/2020
  //new: 2020-12-19

  if (old_date.length == 10) {
    return `${old_date.substr(6, 4)}-${old_date.substr(0, 2)}-${old_date.substr(3, 2)}`;
  }
  else {
    return "Unknown Date";
  }
  

}



//searchs an array for specific object values
function search(req, res, next) {
 
  //var search = []; //create array that will hold the objects with the correct search values

  //console.log(req.body.confirmedCases);
  //console.log(req.body.deaths);
  //console.log(req.body.recoveries);
  

  searched_results = []; //reset

  //loops through all the arrays objects
  for(var i = 0; i < result.length; i++) {
    //checks if country, state, and date match, accepts all if one or more is left blank
    if(result[i]['Country/Region'] == req.body.country || req.body.country == '') {


      if(result[i]['Province/State'] == req.body.state || req.body.state == '') {

        const reformatted_date = ReformatDate(result[i]['ObservationDate']);
        //result[i]['ObservationDate'] = ReformatDate(result[i]['ObservationDate']);

        if(reformatted_date == req.body.date || req.body.date == '') {
          searched_results.push(result[i]);
           //console.log(i);
        }
      }
    }
  }


  next();
}


/*

    ObservationDate: '01/23/2020',
    'Province/State': 'Xinjiang',
    'Country/Region': 'Mainland China',
    'Last Update': '1/23/20 17:00',
    Confirmed: '2.0',
    Deaths: '0.0',
    Recovered: '0.0'

*/



app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidData.html"));
});


app.get('/output.json', (req, res) => {
  console.log('xd');
  res.send("XDDDDD");
  //res.sendFile(path.join(__dirname, "/public" , "output.json"));
});



app.use(express.urlencoded({
  extended: true
}))


// var btn = document.getElementById("btn");
// var ourRequest = new XMLHttpRequest();
// ourRequest.open('GET', './public/output.json')
// ourRequest.onload = function() {
//   var ourData = JSON.parse(ourRequest.responseText);
//   console.l
// }


// btn.addEventListener("click", function() {
  
// })




//app.use(search); //middleware

app.post('/', search,  (req, res) => {
  //console.log( "XDXD XDXD: " + __dirname + "/public/output.json");

  console.log(req.body);

  console.log(searched_results.length);
  for (let i = 0; i < searched_results.length; ++i) {
    console.log(`${i}: ${JSON.stringify(searched_results[i])}`);
  }
  
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end

  //res.end();
  res.sendFile(path.join(__dirname, "/public" , "output.json"));

});


app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})