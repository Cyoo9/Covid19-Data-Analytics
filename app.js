const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;

var bodyParser = require("body-parser");
var multer  = require('multer');
var csvFileName = "covid_19_data.csv"; //just testing the function
var csv = fs.readFileSync(csvFileName); 
var List = require("collections/list"); //used for csv after array
var list = new List([])

function csvParser(csv){

  var lines=csv.toString().split("\r\n");

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
  console.log(result[0]);
  var search = [];
  var searchIndex = 0;
  for(var i = 0; i < result.length; i++) {

      if(result[i]['Country/Region'] == 'Mainland China') {
          if(result[i]['Province/State'] == 'Anhui') {
            search[searchIndex] = result[i];
            searchIndex = searchIndex + 1;
          }
      }
  }
  let json = JSON.stringify(search);
  //let js = JSON.parse(json);
  fs.writeFileSync('output.json', js);
  
 /* let json = JSON.stringify(result); //JSON
  let js = JSON.parse(json);
  js = JSON.stringify(getObjects(js, 'Province/State', 'Anhui'));
  console.log(js);
  fs.writeFileSync('output.json', js); */
}

function getObjects(obj, key, val) {
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
}

csvParser(csv); //test it
 
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