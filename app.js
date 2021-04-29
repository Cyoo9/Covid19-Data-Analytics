const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require('path');
let ejs = require('ejs');

var bodyParser = require("body-parser");
var multer  = require('multer');
const { ap } = require('list');
const { parse } = require('path');
var result = [];
var searched_results = [];
var outside_data = [];

var csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv')); //reads in a cvs file
result = csvParser(csv); //Call csvParser on original data by default

csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/outside_metrics.csv'));
outside_data = csvParser(csv);

app.use(express.static(path.join(__dirname, 'public')));

//send html form for search page (also default page when loading site)
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidData.html"));
})

//send html form for update page
app.get('/update_page', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "covidDataUpdate.html"));
})

app.get('/analysis_page', function(req, res) {
  res.sendFile(path.join(__dirname, "/public" , "dataAnalysis.html"));
})

app.use(express.urlencoded({
  extended: true
}))

//calls the middlewear function "search" after the client posts a request
app.post('/search', search, (req, res) => {
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
})

//called when import button is selected
app.post('/import', analytics2, (req, res) => { 
  csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data_updated.csv')); //change filepath to updated csv
  result = csvParser(csv); //reparse with updated csv file
  res.send("Import complete. Search now on updated database");
})

//called in insert wrapper, uses middlewear to insert data into result array
app.post('/insert', insertData, (req, res) => {
  ConvertToCSV(result); //automatically backsup array for importing later
  res.send("Successfully inserted data");
})

//called in update wrapper, uses middlewear to update data in result array
app.post('/update', updateData, (req, res) => {
  ConvertToCSV(result); //automatically backsup array for importing later
})

//called in delete wrapper, uses middlewear to delete data in result array
app.post('/delete', deleteData, (req, res) => {
  ConvertToCSV(result); //automatically backsup array for importing later
})

app.post('/Q1', analytics1, (req, res) => {

})

app.post('/Q2', analytics2, (req, res) => {
  //res.send("Vaccine Name: " + vaccineName + "\nVaccine Date: " + vaccineDate);
})

app.post('/Q3', analytics3, (req, res) => {

})

app.post('/Q4', search, (req, res) => {  //frontend visualizes deaths and cases next to each other (comparison)
  let json = JSON.stringify(searched_results); //stringify the search array
  fs.writeFileSync('./public/output.json', json); //store the string in a json file to be sent to front-end
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
})


app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})


function analytics1(req, res, next) {
  search(req, res, next);
}

function analytics2(req, res, next) {
  country = "US"; //testing
  let array = CountrySearch(result, country)

  let beforeVax = [];
  let afterVax = [];
  let afterIndex = -1;
  let vaccineName = "";
  let vaccineDate = "";
  
  for(let i = 0; i < outside_data.length; i++) {
    if(outside_data[i]['Country'] == country) {
      vaccineName = outside_data[i]['vaxName'];
      vaccineDate = outside_data[i]['vaxDate']; //use this for searching csv 
    }
  }

  console.log(vaccineName);
  console.log(vaccineDate);

  for(let i = 0; i < array.length; i++) {
    if(ReformatDate(array[i]['ObservationDate']) == vaccineDate) {
      afterIndex = i; 
    }
  }
  
  console.log(afterIndex);
  console.log(array[afterIndex]);

  for(let i = afterIndex; i < array.length; i++) {
    afterVax.push(array[i]);
  }

  for(let i = 0; i < afterIndex; i++) {
    beforeVax.push(array[i]);
  }

  let avgCasesBeforeVax = 0;
  let sum = 0;
  for(let i = 0; i < beforeVax.length; i++) {
    sum += parseInt(beforeVax[i]['Confirmed']);
  }
  avgCasesBeforeVax = sum / beforeVax.length;

  let avgCasesAfterVax = 0;
  sum = 0;
  for(let i = 0; i < afterVax.length; i++) {
    sum += parseInt(afterVax[i]['Confirmed']);
  }
  avgCasesAfterVax = sum / afterVax.length;

  let avgDeathsBeforeVax = 0;
  sum = 0;
  for(let i = 0; i < beforeVax.length; i++) {
    sum += parseInt(beforeVax[i]['Deaths']);
  }
  avgDeathsBeforeVax = sum / beforeVax.length;

  let avgDeathsAfterVax = 0;
  sum = 0;
  for(let i = 0; i < afterVax.length; i++) {
    sum += parseInt(afterVax[i]['Deaths']);
  }
  avgDeathsAfterVax = sum / afterVax.length;

  let avgRecoveriesBeforeVax = 0;
  sum = 0;
  for(let i = 0; i < beforeVax.length; i++) {
    sum += parseInt(beforeVax[i]['Recovered']);
  }
  avgRecoveriesBeforeVax = sum / beforeVax.length;

  let avgRecoveriesAfterVax = 0;
  sum = 0;
  for(let i = 0; i < afterVax.length; i++) {
    sum += parseInt(afterVax[i]['Recovered']);
  }
  avgRecoveriesAfterVax = sum / afterVax.length;

  let vaxObj = {'avgCasesBeforeVax' : avgCasesBeforeVax,
                'avgCasesAfterVax' : avgCasesAfterVax, 
                'avgDeathsBeforeVax' : avgDeathsBeforeVax, 
                'avgDeathsAfterVax' : avgDeathsAfterVax, 
                'avgRecoveriesBeforeVax' : avgRecoveriesBeforeVax,
                'avgRecoveriesAfterVax' : avgRecoveriesAfterVax,
                'VaccineName' : vaccineName,
                'VaccineDate' : vaccineDate
                };

  array.push(vaxObj);
  fs.writeFileSync('./public/output.json', JSON.stringify(array));

  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  next();
}

function analytics3(req, res, next) {
    search(req, res, next);
}

/*function sortByCases() { //fix algorithm to use it later
  let obj = {};
  let countryCases = [];

  for(let i = 0; i < result.length; i++) { //sum up all cases for each country
    if(!(countryCases.includes(result[i]['Country']))) {
      obj[window[result[i]['Country']]] = parseInt(result[i]['Confirmed']);
      countryCases.push(obj);
    } else {
      countryCases[countryCases.findIndex(x => x.theobj === obj)]['Country'] += parseInt(result[i]['Confirmed']); 
    }
  }

  for(let i = 0; i < countryCases.length; i++) { //sort the summed cases
    let min = i; 
    for(let j = i + 1; j < countryCases.length; j++) {
      if(countryCases[j]['Country'] < countryCases[min]) {
        min = j;
      }
    }
    if(min != i) {
      let tmp = countryCases[i];
      countryCases[i] = countryCases[min];
      coutryCases[min] = tmp;
    }
  }

  return countryCases;
} */

//parses a cvs file into an array
function csvParser(csv){

  var parsed = []; //clear array

  var lines=csv.toString().split("\r\n"); //split cvs file into readable lines of data by endlines
  var headers=lines[0].split(","); //split the first line into object variable names

  //goes through every line but the header line
  for(var i=1;i<lines.length - 1;i++){ //last line is empty. dont put that in the array

	  var obj = {}; //create new object to be added to the array
	  var currentline = lines[i].split(","); //split the current line into object variable values

    //hotfix for provinces with commas in the name
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

	  parsed.push(obj); //push newly created object on to array
  }
  return parsed;
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
          //checks if confirmed, deaths, and recovered are above minimum values
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

//inserts data into result array
function insertData(req, res, next) {
  //gets current date and time for last update
  var currentdate = new Date(); 
  var datetime =  currentdate.getMonth()+1  + "/" 
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear() + " "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
  
  //create new object with the insert data
  var obj = {
    SNo: (parseInt(result[result.length-1]['SNo']) + 1) + "", //sets serial number automatically
    ObservationDate: req.body.insertDate,
    'Province/State': req.body.insertState,
    'Country/Region': req.body.insertCountry,
    'Last Update': datetime,
    Confirmed: req.body.newCases,
    Deaths: req.body.newDeaths,
    Recovered: req.body.newRecoveries
  };
  //pushes new insert
  result.push(obj);
  next();
}

//updates data in result array
function updateData(req, res, next) {
  //gets current date and time for last update
  var currentdate = new Date(); 
  var datetime =  currentdate.getMonth()+1  + "/" 
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear() + " "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();

  //updates data at given SNo if the SNo exists
  if(result.findIndex(x => x.SNo === req.body.updateSno) != -1) {
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['ObservationDate'] = req.body.updateDate;
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['Province/State'] = req.body.updateState;
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['Country/Region'] = req.body.updateCountry;
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['Confirmed'] = req.body.updateCases;
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['Deaths'] = req.body.updateDeaths;
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['Recovered'] = req.body.updateRecoveries;
    result[result.findIndex(x => x.SNo === req.body.updateSno)]['Last Update'] = datetime;
    res.send("Successfully updated data");
  }
  else {
    res.send("Incorrect serial number. Try again.");
  }
  next();
}

//deletes data in result array
function deleteData(req, res, next) {
  //deletes data at given SNo if SNo exists
  if(result.findIndex(x => x.SNo === req.body.deleteSno) != -1) {
    result.splice(result.findIndex(x => x.SNo === req.body.deleteSno), 1); //removes from array
    res.send("Successfully deleted data");
  }
  else {
    res.send("Incorrect serial number. Try again.");
  }
  next();
}

//converts an array to a csv file called covid_19_data_updated.csv
function ConvertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray; //gets array

  var str = 'SNo,ObservationDate,Province/State,Country/Region,Last Update,Confirmed,Deaths,Recovered\r\n'; //harcode headers

  //adds each value from each array object, sperated by commas
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
  fs.writeFileSync('./CSV Files/covid_19_data_updated.csv', str); //writes to file
}

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

function CountrySearch(arr, country) {
  
  let search = [];

  for(let i = 0; i < arr.length; i++) {
    if(arr[i]['Country/Region'] == country) {
      search.push(arr[i]);
      if(arr[i]['Province/State'] == 'Recovered') {
        search[search.length-2]['Recovered'] == arr[i]
      }
    }
  }

  let datesChecked = [];
  let totalCon = 0;
  let totalRec = 0;
  let totalDed = 0;
  let newObj = {};
  let array = [];
  let retArray = [];
  let alreadyChecked = false;

  for(let i = 0; i < search.length; i++) {
    alreadyChecked = false;
    for(var index in datesChecked) {
      if(datesChecked[index].includes(search[i]['ObservationDate'])) {
        alreadyChecked = true;
      }
    }
    if(!alreadyChecked) {
      totalCon = parseInt(search[i]['Confirmed']);
      totalRec = parseInt(search[i]['Recovered']);
      totalDed = parseInt(search[i]['Deaths']);
      for(let j = i+1; j < search.length; j++) {
        if(search[i]['ObservationDate'] == search[j]['ObservationDate']) {
          totalCon += parseInt(search[j]['Confirmed']);
          totalRec += parseInt(search[j]['Recovered']);
          totalDed += parseInt(search[j]['Deaths']);
        }
      }
      datesChecked.push(search[i]['ObservationDate']);
      newObj = {'ObservationDate' : search[i]['ObservationDate'],
                'Country' : country, 
                'Confirmed' : totalCon, 
                'Deaths' : totalDed, 
                'Recovered' : totalRec
                };
      array.push(newObj);
    }
  }

  retArray.push(array[0]);
  for(let i = 1; i < array.length; i++) {
    newObj = {'ObservationDate' : array[i]['ObservationDate'],
              'Country' : country, 
              'Confirmed' : parseInt(array[i]['Confirmed']) - parseInt(array[i-1]['Confirmed']), 
              'Deaths' : parseInt(array[i]['Deaths']) - parseInt(array[i-1]['Deaths']), 
              'Recovered' : parseInt(array[i]['Recovered']) - parseInt(array[i-1]['Recovered'])
              };
    retArray.push(newObj);
  }

  fs.writeFileSync('./public/output2.json', JSON.stringify(array));

  return retArray;
}