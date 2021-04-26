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
var searched_results = [];
var reqType = "";

//parses a cvs file into an array
function csvParser(csv){

  result = []; //clear array

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
    if(old_date[2] == '/') {
      return `${old_date.substr(6, 4)}-${old_date.substr(0, 2)}-${old_date.substr(3, 2)}`;
    }
    else if(old_date[4] == '-') {
      return old_date;
    }
    else {
      return "Unknown Date";
    }
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
      if(result[i]['Province/State'] == req.body.state ||req.body.state == '') {
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
})

app.get('/update_page', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidDataUpdate.html"));
})

app.use(express.urlencoded({
  extended: true
}))

//calls the middlewear function "search" after the client posts a request
app.post('/search', search, (req, res) => {
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end
  res.sendFile(path.join(__dirname, "/public" , "output.json"));
})

app.post('/import', (req, res) => {
  csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data_updated.csv'));
  csvParser(csv); //reparse with updated csv file
  res.send("Import complete. Search now on updated database");
})


app.post('/insert', (req, res) => {
  reqType = "insert";
  InUpDel(req, res);

  res.send("COVID-19 data inserted successfully");
  
})

app.post('/update', (req, res) => {
  reqType = "update";
  InUpDel(req, res);

  res.send("COVID-19 data updated successfully");
})

app.post('/delete', (req, res) => {
  reqType = "delete";
  InUpDel(req, res);

  res.send("COVID-19 data deleted successfully");
})

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})




// function buttonAlert(button){
//     if (button.id == "insert-btn") {
//       confirm("You just inserted");
//     }
//     else if (button.id == "delete-btn") {
//       confirm("Are you sure you want to delete ?");
//     }
//     else {
//       confirm ("Are you sure you want to update?");
//     }
  
//   }




function InUpDel(req, res) {

  var currentdate = new Date(); 
  var datetime =  currentdate.getMonth()+1  + "/" 
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear() + " "  
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
      if(result.findIndex(x => x.SNo === req.body.deleteSno) != -1) {
        result.splice(result.findIndex(x => x.SNo === req.body.deleteSno), 1); //removes from array
        /*var index = result.findIndex(x => x.SNo === "" + (parseInt(req.body.deleteSno) + 1));
        if(index != -1) {
          for(var i = index; i < result.length; i++) {
            result[i]['SNo'] = "" + (parseInt(result[i]['SNo']) - 1);
          }
        }*/
        res.send("Delete Complete");
      }
    }
    if(reqType == "update") {
      if(result.findIndex(x => x.SNo === req.body.updateSno) != -1) {
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['ObservationDate'] = req.body.updateDate;
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['Province/State'] = req.body.updateState;
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['Country/Region'] = req.body.updateCountry;
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['Confirmed'] = req.body.updateCases;
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['Deaths'] = req.body.updateDeaths;
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['Recovered'] = req.body.updateRecoveries;
        result[result.findIndex(x => x.SNo === req.body.updateSno)]['Last Update'] = datetime;
        res.send("Update Complete");
      } else {
        res.send("SNo doesn't exist");
      }
    }
  }

  ConvertToCSV(result);

  console.log("Changes confirmed");
} 

function ConvertToCSV(objArray) { 
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = 'SNo,ObservationDate,Province/State,Country/Region,Last Update,Confirmed,Deaths,Recovered\r\n';

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