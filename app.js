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

app.get('/update_page', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidDataUpdate.html"));
});

app.use(express.urlencoded({
  extended: true
}))

//calls the middlewear function "search" after the client posts a request
app.post('/search', search,  (req, res) => {

  //csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv'));
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end
  fs.writeFileSync('./CSV Files/covid_19_data_updated.csv', ConvertToCSV(searched_results)); 
  res.sendFile(path.join(__dirname, "/public" , "output.json"));
});


/*app.post('/update', InUpDel, search, (req, res) => {
  let csvContent = ConvertToCSV(result); //result will already update here after InUpDel middleware function
  fs.writeFileSync('./CSV Files/covid_19_data_updated.csv', csvContent);
  csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data_updated.csv'));
  
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end
  res.sendFile(path.join(__dirname, "/public" , "output.json"));
})*/

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})

function InUpDel(req, res, next) {

  var currentdate = new Date(); 
  var datetime = "Last Sync: " + currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear() + " @ "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
  
  if(req.body.sno == '') {
    var obj = {
      SNo: result[result.length-1]['SNo']+1,
      ObservationDate: req.body.obdt,
      'Province/State': req.body.pvst,
      'Country/Region': req.body.corg,
      'Last Update': datetime,
      Confirmed: req.body.con,
      Deaths: req.body.ded,
      Recovered: req.body.rev
    };
    result.push(obj);
  }
  else {
    var index = -1;
    for(var i = 0; i < result.length; i++) {
      if(result[i]['SNo'] == req.body.sno) {
        index = i;
      }
    }
    let json = JSON.stringify(results[i]);
    fs.writeFileSync('./public/output.json', json);
    res.sendFile(path.join(__dirname, "/public" , "output.json"));
    if(DELETE) {
      result.splice(index, 1); //removes from array?
    }
    if(UPDATE) {
      if(req.body.obdt != '') {
        result[index]['ObservationDate'] = req.body.obdt;
      }
      if(req.body.pvst != '') {
        result[index]['Province/State'] = req.body.pvst;
      }
      if(req.body.corg != '') {
        result[index]['Country/Region'] = req.body.corg;
      }
      if(req.body.con != '') {
        result[index]['Confirmed'] = req.body.con;
      }
      if(req.body.ded != '') {
        result[index]['Deaths'] = req.body.ded;
      }
      if(req.body.rev != '') {
        result[index]['Recovered'] = req.body.rev;
      }
      result[index]['Last Update'] = datetime;
    }
  }

  var obj = {
    SNo: '',
    ObservationDate: '',
    'Province/State': '',
    'Country/Region': '',
    'Last Update': '',
    Confirmed: '',
    Deaths: '',
    Recovered: ''
  };
  res.send("Changes confirmed");
  next();
}

function ConvertToCSV(objArray) { //NEED TO ADD COMMA BETWEEN COUNTY AND STATE (revert). Column names (i.e. Sno, County, etc) NOT SHOWING
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

  return str;
}




/*

  Testing buttons in covidData.html 

*/



app.post('/insert', (req, res) => {
  //When you click the insert button, the form data
  //will show up on node console
  console.log(" Recevied insert request ");
  console.log(req.body);
});

app.post('/update', (req, res) => {
  //When you click the update button, the form data
  //will show up on node console
  console.log(" Recevied update request ");
  console.log(req.body);
});

app.post('/delete', (req, res) => {
  //When you click the delete button, the form data
  //will show up on node console
  console.log(" Recevied delete request ");
  console.log(req.body);
});


app.post('/import', (req, res) => {
  console.log(" Recevied import request ");
  console.log(req.body);

});

