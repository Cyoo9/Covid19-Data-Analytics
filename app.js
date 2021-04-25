const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require('path');
let ejs = require('ejs');

var bodyParser = require("body-parser");
var multer  = require('multer');
const { ap } = require('list');
var csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv')); //reads in a cvs file
var result = [];
let searched_results = [];
var reqType = "";

//parses a cvs file into an array
function csvParser(csv){

  var lines=csv.toString().split("\r\n"); //split cvs file into readable lines of data by endlines
  var headers=lines[0].split(","); //split the first line into object variable names

  //goes through every line but the header line
  for(var i=1;i<lines.length - 1;i++){ //last line is empty. dont put that in the array

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
  return next;
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidData.html"));
});

app.get('/update_page', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidDataUpdate.html"));
});

app.use(express.urlencoded({
  extended: true
}))

//calls the middlewear function "search" after the client posts a request
app.post('/search', search, (req, res) => {

  //csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv'));
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end
  res.sendFile(path.join(__dirname, "/public" , "output.json"));
});

app.post('/import', (req, res) => {
  csv = "covid_19_data_updated.csv";
  csvParser(csv); //reparse with updated csv file
  res.send("Import complete. Search now on updated database");
})


app.post('/insert', (req, res) => {
  reqType = "insert";
  InUpDel(req, res);
  
})

app.post('/update', (req, res) => {
  reqType = "update";
  InUpDel(req, res);
})

app.post('/delete', (req, res) => {
  reqType = "delete";
  InUpDel(req, res);
})

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})

function InUpDel(req, res) {

  csvParser(csv);
  var currentdate = new Date(); 
  var datetime = "Last Sync: " + currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear() + " @ "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
  
  if(reqType == "insert") {;
    var obj = {
      SNo: (parseInt(result[result.length-1]['SNo']) + 1) + "",
      ObservationDate: req.body.insertDate,
      'Province/State': req.body.insertState,
      'Country/Region': req.body.insertCountry,
      'Last Update': datetime,
      Confirmed: req.body.newCases,
      Deaths: req.body.newDeaths,
      Recovered: req.body.newRecoveries
    };
    result.push(obj); 
  }
  else {
    if(reqType == "delete") { 
        let json = JSON.stringify(result[req.body.deleteSno - 1]); //index that is being deleted. put it into output.json
        result.splice(req.body.deleteSno - 1, 1); //removes from array
        fs.writeFileSync('./public/output.json', json);
        res.sendFile(path.join(__dirname, "/public" , "output.json")); 
        /*for(let i = 0; i < result.length; i++) { //shift all except the first sno by 1. 
          if(result[i]['SNo'] != 1) { 
            result[i]['Sno'] -= 1;
          }
        }*/
    }
    if(reqType == "update") {
      if(req.body.updateDate != '') {
        result[req.body.updateSno - 1]['ObservationDate'] = req.body.updateDate;
      }
      if(req.body.updateState != '') {
        result[req.body.updateSno - 1]['Province/State'] = req.body.updateState;
      }
      if(req.body.updateCoutry != '') {
        result[req.body.updateSno - 1]['Country/Region'] = req.body.updateCountry;
      }
      if(req.body.updateCases != '') {
        result[req.body.updateSno - 1]['Confirmed'] = req.body.updateCases;
      }
      if(req.body.updateDeaths != '') {
        result[req.body.updateSno - 1]['Deaths'] = req.body.updateDeaths;
      }
      if(req.body.updateRecoveries != '') {
        result[req.body.updateSno - 1]['Recovered'] = req.body.updateRecoveries;
      }
      result[req.body.updateSno - 1]['Last Update'] = datetime; //???
      let json = JSON.stringify(result[req.body.updateSno - 1]); 
      fs.writeFileSync('./public/output.json', json); 

    }
  }

  ConvertToCSV(result);

  /*var obj = {
    SNo: '',
    ObservationDate: '',
    'Province/State': '',
    'Country/Region': '',
    'Last Update': '',
    Confirmed: '',
    Deaths: '',
    Recovered: ''
  };*/

  //console.log("Changes confirmed");
  res.send("Changes confirmed");
}

function ConvertToCSV(objArray) { 
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = 'SNo,ObservationDate,Province/State,Country/Region,Last Update,Confirmed,Deaths,Recovered\r\n';

  console.log(array[2]); //test Sno 3 deletion. Should log Sno 4 (works) 
  console.log(array[array.length - 1]) //test insert (works)
  console.log(array[0]); //should be updated (works)

  for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if(index != 'Recovered') {
          if(array[i][index].includes(',')) { 
            line += '\"' + array[i][index] + '\"' + ',';
          }
          else {
            line += array[i][index] + ',';
          }
        }
        else {
          line += array[i][index];
        }
      }
     str += line + '\r\n';
  }
  fs.writeFileSync('./CSV Files/covid_19_data_updated.csv', str);
}


