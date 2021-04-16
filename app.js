const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;

var bodyParser = require("body-parser");
var multer  = require('multer');
var csvFileName = "covid_19_data.csv"; //just testing the functions
var csv = fs.readFileSync(csvFileName); //reads in a cvs file

//parses a cvs file into an array
function csvParser(csv){

  var lines=csv.toString().split("\r\n"); //split cvs file into readable lines of data by endlines
  var result = []; //create the array
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

  return result;
}

//searchs an array for specific object values
function search(result) {

  //console.log(result[0]);
  var search = []; //create array that will hold the objects with the correct search values

  //loops through all the arrays objects
  for(var i = 0; i < result.length; i++) {
    //stub
    if(result[i]['Country/Region'] == 'Mainland China') {
      if(result[i]['ObservationDate'] == '01/23/2020') {
        search.push(result[i]);
      }
    }
  }

  let json = JSON.stringify(search); //stringify the search array
  fs.writeFileSync('output.json', json); //store the string in a json file to be sent to front-end
}

//We might not need getObjects anymore caleb

/*function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
} */

//test parser and stub search
var result = csvParser(csv);
search(result);
 
/*app.use(express.urlencoded({
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