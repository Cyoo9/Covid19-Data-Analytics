const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require('path');
let ejs = require('ejs');

var bodyParser = require("body-parser");
var multer  = require('multer');
const { ap, all, of } = require('list');
const { parse } = require('path');
const { PassThrough } = require('stream');
var result = []; //holds all data
var searched_results = []; //holds data from a search
var outside_data = []; //holds data collected outside original file
var aggregatedCountryData = []; //holds data for each country aggregate totals
var worldData = []; //holds data for aggregate world totals
var countryData = []; //2D array holds non-cumulative data for each country

console.log("Starting Server...");

var csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv')); //reads in a cvs file
result = csvParser(csv); //put into usable array

csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/outside_metrics.csv')); //gathers outside metrics
outside_data = csvParser(csv); //put into usable array

csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/aggregated_country_data.csv')); //aggregated data
aggregatedCountryData = csvParser(csv); //put into usable array

csv = fs.readFileSync(path.resolve(__dirname, './CSV Files/world_data.csv')); //world data
worldData = csvParser(csv); //put into usable array

countryData = createCountryData(); //create 2D array of non-cumulative data for each country

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
app.post('/import', (req, res) => { 
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

app.post('/Q1', analytics1, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q2', analytics2, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q3', analytics3, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q4', analytics4, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q5', analytics5, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q6', analytics6, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q7', analytics7, (req, res) => {}) //calls analytic 1 middlewear

app.post('/Q8', analytics8, (req, res) => {}) //calls analytic 1 middlewear

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})

//Writes array of the average cases, deaths, and recoveries for each country
function analytics1(req, res, next) {
  let retArray = [];
  let obj = {};
  //divide each aggregated metric by the number of dates recorded in order to get average
  for(let i = 0; i < aggregatedCountryData.length; i++) {
    obj = { 'Country' : aggregatedCountryData[i]['Country'],
            'avgCasesPerDay' : aggregatedCountryData[i]['Confirmed'] / aggregatedCountryData[i]['numDates'],
            'avgDeathsPerDay' : aggregatedCountryData[i]['Deaths'] / aggregatedCountryData[i]['numDates'],
            'avgRecoveriesPerDay' : aggregatedCountryData[i]['Deaths'] / aggregatedCountryData[i]['numDates']
          };
    retArray.push(obj); // push to array
  }

  fs.writeFileSync('./public/output.json', JSON.stringify(retArray)); //write array to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json

  next();
}

//sends average cases, deaths, and recoveries before and after some countries recorded first vaccination date
function analytics2(req, res, next) {
  let country = req.body.Country; //get country
  let array = [];

  //find countries non-cumulative data
  for(var i = 0; i < countryData.length; i++) {
    if(countryData[i][0]['Country'] == country) {
      array = countryData[i];
      break;
    }
  }

  //vaccine info stored at the 2nd to last object of the non-cumulative data
  let vaccineName = array[array.length-2]['vaxName'];
  let vaccineDate = array[array.length-2]['vaxDate'];
  
  let casesBeforeSum = 0;
  let casesAfterSum = 0;
  let deathsBeforeSum = 0;
  let deathsAfterSum = 0;
  let recoveriesBeforeSum = 0;
  let recoveriesAfterSum = 0;
  let countBefore = 0;
  let countAfter = 0;

  //go through data (not last two objects), and sum up all the statistics for before and after the vaccine date
  for(let i = 0; i < array.length-2; i++) {
    if(ReformatDate("" + array[i]['ObservationDate']) <= vaccineDate) {
      casesBeforeSum += Math.max(0, parseInt(array[i]['Confirmed']));
      deathsBeforeSum += Math.max(0, parseInt(array[i]['Deaths']));
      recoveriesBeforeSum += Math.max(0, parseInt(array[i]['Recovered']));
      countBefore++;
    }
    else {
      casesAfterSum += Math.max(0, parseInt(array[i]['Confirmed']));
      deathsAfterSum += Math.max(0, parseInt(array[i]['Deaths']));
      recoveriesAfterSum += Math.max(0, parseInt(array[i]['Recovered']));
      countAfter++;
    }
  }

  //created object of averages
  let vaxObj = {'avgCasesBeforeVax' : casesBeforeSum/countBefore,
                'avgCasesAfterVax' : casesAfterSum/countAfter, 
                'avgDeathsBeforeVax' : deathsBeforeSum/countBefore, 
                'avgDeathsAfterVax' : deathsAfterSum/countAfter, 
                'avgRecoveriesBeforeVax' : recoveriesBeforeSum/countBefore,
                'avgRecoveriesAfterVax' : recoveriesAfterSum/countAfter,
                'VaccineName' : vaccineName,
                'VaccineDate' : vaccineDate
                };

  //must put object into array for front end
  let retArray = [];
  retArray.push(vaxObj);

  fs.writeFileSync('./public/output.json', JSON.stringify(retArray)); //write array to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json

  next();
}

//finds two countries and compares their graphs
function analytics3(req, res, next) {
  //get countries
  let country1 = req.body.country1;
  let country2 = req.body.country2;

  let array1 = [];
  let array2 = [];

  //find each counties non-cumulative data
  for(var i = 0; i < countryData.length; i++) {
    if(countryData[i][0]['Country'] == country1) {
      array1 = countryData[i];
    }
    if(countryData[i][0]['Country'] == country2) {
      array2 = countryData[i];
    }
  }

  //combine arrays, front end will seperate the data into graphs
  for(let i = 0; i < array2.length; i++) {
    array1.push(array2[i]);
  }

  fs.writeFileSync('./public/output.json', JSON.stringify(array1)); //write to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json

  next();
}

//compares an input countries cases and deaths in a graph
function analytics4(req, res, next) {
  let country = req.body.Country; //get country
  let array = [];

  //find non-cumulative data
  for(var i = 0; i < countryData.length; i++) {
    if(countryData[i][0]['Country'] == country) {
      array = countryData[i];
      break;
    }
  }

  //front end will handle how graph looks, send
  fs.writeFileSync('./public/output.json', JSON.stringify(array)); //write to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json

  next();
}

//finds recoveries rates of an input country, or gives sorted list of all countries recovery rates
function analytics5(req, res, next) {
  let country = req.body.Country; //get country

  //user entered a country, only send its recover rate
  if(country != "") {
    let index = -1;

    //find country in aggregated data
    for(var i = 0; i < aggregatedCountryData.length; i++) {
      if(aggregatedCountryData[i]['Country'] == country) {
        index = i;
        break;
      }
    }

    if(index > -1) {
      //rate = total recovered / total cases
      let rate = ((parseInt(aggregatedCountryData[index]['Recovered'])/parseInt(aggregatedCountryData[index]['Confirmed']))*100) + "";
      rate = rate.substr(0,5) + "%";

      //create object for rate
      let obj = {'Country' : country, 
                'Effective Recovery Rate' : rate
                };

      //send as array for front-end
      let array = [];
      array.push(obj);
      fs.writeFileSync('./public/output.json', JSON.stringify(array)); //write to json
    }
  }
  //user did not enter a country, find rates for all countries
  else {
    let retArray = [];
    let rate = 0;
    let obj = {};

    //go through all aggregated data, for each, find rate and push to array
    for(let i = 0; i < aggregatedCountryData.length; i++) {
      //rate = total recovered / total cases
      rate = ((parseInt(aggregatedCountryData[i]['Recovered']) / parseInt(aggregatedCountryData[i]['Confirmed']))*100) + "";
      rate = rate.substr(0,5) + "%";
      if(parseInt(aggregatedCountryData[i]['Confirmed']) == 0) {rate = "0%";}
      obj = {'Country' : aggregatedCountryData[i]['Country'], 
             'Effective Recovery Rate' : rate 
            };
      retArray.push(obj);
    }

    //selection sort; find index of max and swap, repeat until end
    let maxIndex = -1;
    for(let i = 0; i < retArray.length; i++) {
      maxIndex = i;
      for(let j = i+1; j < retArray.length; j++) {
        substr1 = retArray[maxIndex]['Effective Recovery Rate'].substring(0, retArray[maxIndex]['Effective Recovery Rate'].length-1);
        substr2 = retArray[j]['Effective Recovery Rate'].substring(0, retArray[j]['Effective Recovery Rate'].length-1);
        if(parseFloat(substr1) < parseFloat(substr2)) {
          maxIndex = j;
        }
      }
      obj = retArray[maxIndex];
      retArray[maxIndex] = retArray[i];
      retArray[i] = obj;
    }

    fs.writeFileSync('./public/output.json', JSON.stringify(retArray)); //write to json
  }
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  next();
}

//find top ten countries for maximum of an input statistic
function analytics6(req, res, next) {
  if(req.body.statType == 'Cases') {
    //sort by cases
    sortType = 'Confirmed';
  } 
  else if(req.body.statType == 'Deaths') {
    //sort by deaths
    sortType = 'Deaths';
  } 
  else {
    //sort by recoveries
    sortType = 'Recovered';
  }  

  //selection sort, only for the first 10 objects
  for(let i = 0; i < 10; i++) {
    let max = i;
    for(let j = i+1; j < aggregatedCountryData.length; j++) {
      if(parseInt(aggregatedCountryData[j][sortType]) > parseInt(aggregatedCountryData[max][sortType])) {
        max = j;
      }
    }
    if(max != i) {
      let temp = aggregatedCountryData[i];
      aggregatedCountryData[i] = aggregatedCountryData[max];
      aggregatedCountryData[max] = temp;
    }
  }

  let topTen = [];
  let obj = {};
  //gather first 10 from the list and put into another array
  for(let i = 0; i < 10; i++) {
    obj = {
      'Country' : aggregatedCountryData[i]['Country'],
      'Cases' : aggregatedCountryData[i]['Confirmed'],
      'Deaths' : aggregatedCountryData[i]['Deaths'],
      'Recoveries' : aggregatedCountryData[i]['Recovered']
    };
    topTen.push(obj);
  }

  fs.writeFileSync('./public/output.json', JSON.stringify(topTen)); //write to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  next();
}

//find the date which a country peaked in one day observation on a given statistic
function analytics7(req, res, next) {
  //get data
  var country = req.body.Country;
  var stat = req.body.Stat;
  var array = [];

  //find non-cumulative data for country
  for(var i = 0; i < countryData.length; i++) {
    if(countryData[i][0]['Country'] == country) {
      array = countryData[i];
      break;
    }
  }

  let date = "";
  let peak = "";

  //all peaks are stored in last object of non-cumulative data; retrieve
  if(stat == "Confirmed") {
    date = array[array.length-1]['casesDate'];
    peak = array[array.length-1]['peakCases'];
  }
  else if(stat == "Deaths") {
    date = array[array.length-1]['deathsDate'];
    peak = array[array.length-1]['peakDeaths'];
  }
  else if(stat == "Recovered") {
    date = array[array.length-1]['recoveredDate'];
    peak = array[array.length-1]['peakRecovered'];
  }
  else {}

  //create object
  var obj = {'Country' : country,
            'Peak Date' : date
            };
  obj[stat] = peak;
  array.splice(array.length-2, 2);
  array.push(obj); //push to end of array for front end, along with usable graph data (not last two objects)
  fs.writeFileSync('./public/output.json', JSON.stringify(array)); //write to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  next();
}

//outputs cumulative totals for world data
function analytics8(req, res, next) {
  fs.writeFileSync('./public/output.json', JSON.stringify(worldData)); 
  res.sendFile(path.join(__dirname, "/public" , "output.json"));

  next();
}

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

  InsertWorldData(req.body.insertCountry, req.body.insertState, req.body.insertDate, req.body.newCases, req.body.newDeaths, req.body.newRecoveries);
  Insert2D(req.body.insertCountry, req.body.insertState, req.body.insertDate, req.body.newCases, req.body.newDeaths, req.body.newRecoveries);
  InsertAggregate(req.body.insertCountry, req.body.insertDate, req.body.newCases, req.body.newDeaths, req.body.newRecoveries);

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
  let country, date, state, index, confirmed, deaths, recoveries; 

  if(result.findIndex(x => x.SNo === req.body.deleteSno) != -1) {

    index = result.findIndex(x => x.SNo === req.body.deleteSno);

    country = result[index]['Country/Region'];
    date = result[index]['ObservationDate'];
    state = result[index]['Province/State'];

    confirmed = result[index]['Confirmed'];
    deaths = result[index]['Deaths'];
    recoveries = result[index]['Recovered'];

    deleteAggregate(country, date, state, confirmed, deaths, recoveries);
    delete2D(country, date, state);
    deleteWorldData(date, confirmed, deaths, recoveries);
    result.splice(index, 1); //removes from array
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

  //var str = 'SNo,ObservationDate,Province/State,Country/Region,Last Update,Confirmed,Deaths,Recovered\r\n'; //harcode headers
  let str = "";
  for(let i = 0; i < array[0].length; i++) {
    if(i != array[0].length - 1)
      str += array[0] + ',';
    else 
      str += array[0] + '\r\n';
  }

  //adds each value from each array object, sperated by commas
  for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if(index != array[0].length - 1) { 
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
  if(array[0] === 'Sno')
    fs.writeFileSync('./CSV Files/covid_data_updated.csv', str); //writes to file
  else if(array[0] === 'Country')
    fs.writeFileSync('./CSV Files/aggregated_country_data_updated.csv', str); //writes to file
  else if(array[0] === 'Date')
    fs.writeFileSync('./CSV Files/world_date_updated.csv', str); //writes to file
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

//given a country, output cumlative or non cumulative data for it (merge state totals when applicable)
function CountrySearch(country, version) {
  
  let search = [];

  //find all data with the given country
  for(let i = 0; i < result.length; i++) {
    if(result[i]['Country/Region'] == country) {
      search.push(result[i]);
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
    //check if this date was captured previously
    for(var index in datesChecked) {
      if(datesChecked[index].includes(search[i]['ObservationDate'])) {
        alreadyChecked = true;
      }
    }
    //if not, sum all statistics on all data with same date (should sum the individual states together)
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
  //if cumlative, can just return
  if(version != "Non-Cumulative") {
    return array;
  }
  //if non-cumulative, we must minus the previous days from this day, to get #new cases, etc recorded that day
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

  return retArray; //return array
}

//creates the 2D non-cumulative array for each country
function createCountryData() {
  countryData = [];
  let allCountries = [];
  //get list of all countries
  for(let i = 0; i < result.length; i++) {
    if(!(allCountries.includes(result[i]['Country/Region']))) {
      allCountries.push(result[i]['Country/Region']);
    }
  }
  let array = [];
  let obj = {};
  let vaccineName = "";
  let vaccineDate = "";
  let maxIndexCases = 0;
  let maxIndexDeaths = 0;
  let maxIndexRecovered = 0;
  //for each country, get noncumulative datapoints and append the vaccineData and the peak data
  for(let i = 0; i < allCountries.length; i++) {
    array = CountrySearch(allCountries[i], "Non-Cumulative");
    vaccineName = "";
    vaccineDate = "";
    //find vaccine data
    for(let j = 0; j < outside_data.length; j++) {
      if(outside_data[j]['Country'] == allCountries[i]) {
        vaccineName = outside_data[j]['vaxName'];
        vaccineDate = outside_data[j]['vaxDate'];
      }
    }
    obj = {
      'Country' : allCountries[i],
      'vaxName' : vaccineName,
      'vaxDate' : vaccineDate,
    };
    array.push(obj); //append vaccine data
    maxIndexCases = 0;
    maxIndexDeaths = 0;
    maxIndexRecovered = 0;
    //find peak data
    for(let j = 1; j < array.length-1; j++) {
      if(parseInt(array[maxIndexCases]['Confirmed']) < parseInt(array[j]['Confirmed'])) {
        maxIndexCases = j;
      }
      if(parseInt(array[maxIndexDeaths]['Deaths']) < parseInt(array[j]['Deaths'])) {
        maxIndexDeaths = j;
      }
      if(parseInt(array[maxIndexRecovered]['Recovered']) < parseInt(array[j]['Recovered'])) {
        maxIndexRecovered = j;
      }
    }
    obj = {
      'Country' : allCountries[i],
      'peakCases' : array[maxIndexCases]['Confirmed'],
      'casesDate' : array[maxIndexCases]['ObservationDate'],
      'peakDeaths' : array[maxIndexDeaths]['Deaths'],
      'deathsDate' : array[maxIndexDeaths]['ObservationDate'],
      'peakRecovered' : array[maxIndexRecovered]['Recovered'],
      'recoveredDate' : array[maxIndexRecovered]['ObservationDate']
    };
    array.push(obj); //append peak data
    countryData.push(array);
  }
  return countryData;
}

function InsertWorldData(country, state, date, cases, deaths, recoveries) {
  var existingCountry = false;
  var index = -1;
  if(state == "") {
    for(let i = 0; i < aggregatedCountryData.length; i++) {
      if(aggregatedCountryData[i]['Country'] == country) {
        existingCountry = true;
        index = i;
        break;
      }
    }
  }
  else {
    for(let i = result.length-1; i >= 0; i--) {
      if(result[i]['Country/Region'] == country && result[i]['Province/State'] == state) {
        existingCountry = true;
        index = i;
        break;
      }
    }
  }
  var insertedWorld = false;
  for(let i = 0; i < worldData.length; i++) {
    if(ReformatDate(worldData[i]['Date']) == date) {
      if(existingCountry) {
        if(state == "") {
          worldData[i]['worldCases'] = parseInt(worldData[i]['worldCases']) - parseInt(aggregatedCountryData[index]['Confirmed']) + parseInt(cases);
          worldData[i]['worldDeaths'] = parseInt(worldData[i]['worldDeaths']) - parseInt(aggregatedCountryData[index]['Deaths']) + parseInt(deaths);
          worldData[i]['worldRecovered'] = parseInt(worldData[i]['worldRecovered']) - parseInt(aggregatedCountryData[index]['Recovered']) + parseInt(recoveries);
        }
        else {
          worldData[i]['worldCases'] = parseInt(worldData[i]['worldCases']) - parseInt(result[index]['Confirmed']) + parseInt(cases);
          worldData[i]['worldDeaths'] = parseInt(worldData[i]['worldDeaths']) - parseInt(result[index]['Deaths']) + parseInt(deaths);
          worldData[i]['worldRecovered'] = parseInt(worldData[i]['worldRecovered']) - parseInt(result[index]['Recovered']) + parseInt(recoveries);
        }
      }
      else {
        worldData[i]['worldCases'] = parseInt(worldData[i]['worldCases']) + parseInt(cases);
        worldData[i]['worldDeaths'] = parseInt(worldData[i]['worldDeaths']) + parseInt(deaths);
        worldData[i]['worldRecovered'] = parseInt(worldData[i]['worldRecovered']) + parseInt(recoveries);
      }
      insertedWorld = true;
    }
  }
  if(!insertedWorld) {
    var obj = {
      'Date' : date,
      'worldCases' : cases,
      'worldDeaths' : deaths,
      'worldRecovered' : recoveries
    };
    worldData.push(obj); 
  }
}

function Insert2D(country, state, date, cases, deaths, recoveries) {
  let countryIndex = -1;
  for(let i = 0; i < countryData.length; i++) {
    if(countryData[i][0]['Country'] == country) {
      countryIndex = i;
      break;
    }
  }
  if(countryIndex != -1) {
    let peakObj = countryData[countryIndex][countryData[countryIndex].length-1];
    let vaxObj = countryData[countryIndex][countryData[countryIndex].length-2];
    countryData[countryIndex].splice(countryData[countryIndex].length-2, 2);
    let obj = {};
    let index = -1;
    if(state == "") {
      for(let i = 0; i < aggregatedCountryData.length; i++) {
        if(aggregatedCountryData[i]['Country'] == country) {
          index = i;
          break;
        }
      }
      obj = {
        'ObservationDate' : date,
        'Country' : country, 
        'Confirmed' : parseInt(cases) - parseInt(aggregatedCountryData[index]['Confirmed']), 
        'Deaths' : parseInt(deaths) - parseInt(aggregatedCountryData[index]['Deaths']), 
        'Recovered' : parseInt(recoveries) - parseInt(aggregatedCountryData[index]['Recovered'])
      };
      countryData[countryIndex].push(obj);
    }
    else {
      var existingState = false;
      for(let i = result.length-1; i >= 0; i--) {
        if(result[i]['Country/Region'] == country && result[i]['Province/State'] == state) {
          existingState = true;
          index = i;
          break;
        }
      }
      var previousDate = false;
      if(existingState) {
        for(var i = 0; i < countryData[countryIndex].length; i++) {
          if(ReformatDate(countryData[countryIndex][i]['ObservationDate']) == date) {
            countryData[countryIndex][i]['Confirmed'] = parseInt(countryData[countryIndex][i]['Confirmed']) + (parseInt(cases) - parseInt(result[index]['Confirmed']));
            countryData[countryIndex][i]['Deaths'] = parseInt(countryData[countryIndex][i]['Deaths']) + (parseInt(deaths) - parseInt(result[index]['Deaths']));
            countryData[countryIndex][i]['Recovered'] = parseInt(countryData[countryIndex][i]['Recovered']) + (parseInt(recoveries) - parseInt(result[index]['Recovered']));
            previousDate = true;
            obj = countryData[countryIndex][i];
            break;
          }
        }
        if(!previousDate) {
          obj = {
            'ObservationDate' : date,
            'Country' : country, 
            'Confirmed' : parseInt(cases) - parseInt(result[index]['Confirmed']), 
            'Deaths' : parseInt(deaths) - parseInt(result[index]['Deaths']), 
            'Recovered' : parseInt(recoveries) - parseInt(result[index]['Recovered'])
          };
          countryData[countryIndex].push(obj);
        }
      }
      else {
        for(var i = 0; i < countryData[countryIndex].length; i++) {
          if(ReformatDate(countryData[countryIndex][i]['ObservationDate']) == date) {
            countryData[countryIndex][i]['Confirmed'] = parseInt(countryData[countryIndex][i]['Confirmed']) + parseInt(cases);
            countryData[countryIndex][i]['Deaths'] = parseInt(countryData[countryIndex][i]['Deaths']) + parseInt(deaths);
            countryData[countryIndex][i]['Recovered'] = parseInt(countryData[countryIndex][i]['Recovered']) + parseInt(recoveries);
            previousDate = true;
            obj = countryData[countryIndex][i];
            break;
          }
        }
        if(!previousDate) {
          obj = {
            'ObservationDate' : date,
            'Country' : country, 
            'Confirmed' : cases, 
            'Deaths' : deaths, 
            'Recovered' : recoveries
          };
          countryData[countryIndex].push(obj);
        }
      }
    }

    if(parseInt(peakObj['peakCases']) < parseInt(obj['Confirmed'])) {
      peakObj['peakCases'] = obj['Confirmed'];
      peakObj['casesDate'] = obj['ObservationDate'];
    }
    if(parseInt(peakObj['peakDeaths']) < parseInt(obj['Deaths'])) {
      peakObj['peakDeaths'] = obj['Deaths'];
      peakObj['deathsDate'] = obj['ObservationDate'];
    }   
    if(parseInt(peakObj['peakRecovered']) < parseInt(obj['Recovered'])) {
      peakObj['peakRecovered'] = obj['Recovered'];
      peakObj['recoveredDate'] = obj['ObservationDate'];
    }
    countryData[countryIndex].push(vaxObj);
    countryData[countryIndex].push(peakObj);
  }
  else {
    let array = [];
    let obj = {
      'ObservationDate' : date,
      'Country' : country, 
      'Confirmed' : cases, 
      'Deaths' : deaths, 
      'Recovered' : recoveries 
    };
    array.push(obj);
    obj = {
      'Country' : country,
      'vaxName' : "",
      'vaxDate' : ""
    };
    array.push(obj);
    obj = {
      'Country' : country,
      'peakCases' : cases,
      'casesDate' : date,
      'peakDeaths' : deaths,
      'deathsDate' : date,
      'peakRecovered' : recoveries,
      'recoveredDate' : date
    };
    array.push(obj);
    countryData.push(array);
  }
}

function InsertAggregate (country, date, cases, deaths, recoveries) {
  let index = -1;
  for(let i = 0; i < aggregatedCountryData.length; i++) {
    if(aggregatedCountryData[i]['Country'] == country) {
      index = i;
      break;
    }
  }
  if(index != -1) {
    aggregatedCountryData[index]['Confirmed'] = cases;
    aggregatedCountryData[index]['Deaths'] = deaths;
    aggregatedCountryData[index]['Recovered'] = recoveries;
    aggregatedCountryData[index]['numDates'] = parseInt(aggregatedCountryData[index]['numDates']) + 1;
    for(var i = 0; i < result.length; i++) {
      if(result[i][ObservationDate] == date) {
        aggregatedCountryData[index]['numDates'] = parseInt(aggregatedCountryData[index]['numDates']) - 1;
      }
    }
  }
  else {
    let obj = {
      'Country' : country,
      'Confirmed' : cases,
      'Deaths' : deaths,
      'Recovered' : recoveries,
      'numDates' : 1
    };
    aggregatedCountryData.push(obj);
  }
}

function deleteAggregate(country, date, state, confirmed, deaths, recoveries) {
  var changeAggregate = false;
  for(let i = result.length-1; i >= 0; i--) {
    if(result[i]['Country/Region'] == country && result[i]['Province/State'] == state) {
      if(changeAggregate) {
        if(state == "") {
          aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Confirmed'] = result[i]['Confirmed'];
          aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Deaths'] = result[i]['Deaths'];
          aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Recovered'] = result[i]['Recovered'];
        }
        else {
          aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Confirmed'] = parseInt(aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Confirmed']) - parseInt(confirmed);
          aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Deaths'] = parseInt(aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Deaths']) - parseInt(deaths);
          aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Recovered'] = parseInt(aggregatedCountryData[aggregatedCountryData.findIndex(x => x.Country === country)]['Recovered']) - parseInt(recoveries);
        }
        break;
      }
      if(result[i]['ObservationDate'] == date) {
        changeAggregate = true;
      }
      else {
        break;
      }
    }
  }
}

function delete2D(country, date, state) {
  var index = -1;
  for(var i = 0; i < countryData.length; i++) {
    if(countryData[i][0]['Country'] == country) {
      index = i;
      break;
    }
  }
  if(state == "") {
    for(var i = 0; i < countryData[index].length; i++) {
      if(countryData[index][i]['ObservationDate'] == date) {
        countryData[index].splice(i, 1);
        break;
      }
    }
    if(countryData[index][countryData[index].length-1]['casesDate'] == date || countryData[index][countryData[index].length-1]['deathsDate'] == date || countryData[index][countryData[index].length-1]['recoveredDate'] == date) {
      maxIndexCases = 0;
      maxIndexDeaths = 0;
      maxIndexRecovered = 0;
      //find peak data
      for(let j = 1; j < array.length-1; j++) {
        if(parseInt(countryData[index][maxIndexCases]['Confirmed']) < parseInt(countryData[index][j]['Confirmed'])) {
          maxIndexCases = j;
        }
        if(parseInt(countryData[index][maxIndexDeaths]['Deaths']) < parseInt(countryData[index][j]['Deaths'])) {
          maxIndexDeaths = j;
        }
        if(parseInt(countryData[index][maxIndexRecovered]['Recovered']) < parseInt(countryData[index][j]['Recovered'])) {
          maxIndexRecovered = j;
        }
      }
      countryData[index][countryData[index].length-1]['peakCases'] = countryData[index][maxIndexCases]['Confirmed'];
      countryData[index][countryData[index].length-1]['casesDate'] = countryData[index][maxIndexCases]['ObservationDate'];
      countryData[index][countryData[index].length-1]['peakDeaths'] = countryData[index][maxIndexDeaths]['Deaths'];
      countryData[index][countryData[index].length-1]['deathsDate'] = countryData[index][maxIndexDeaths]['ObservationDate'];
      countryData[index][countryData[index].length-1]['peakRecovered'] = countryData[index][maxIndexRecovered]['Recovered'];
      countryData[index][countryData[index].length-1]['recoveredDate'] = countryData[index][maxIndexRecovered]['ObservationDate'];
    }
  }
  else {
    var resultIndex = -1;
    for(var i = 0; i < result.length; i++) {
      if(result[i]['ObservationDate'] == date && result[i]['Province/State'] == state && result[i]['Country/Region'] == country) {
        resultIndex = i;
      }
    }
    var addedCases = parseInt(result[index]['Confirmed']);
    var addedDeaths = parseInt(result[index]['Deaths']);
    var addedRecoveries = parseInt(result[index]['Recovered']);
    for(var i = resultIndex-1; i >= 0; i--) {
      if(result[i]['Province/State'] == state && result[i]['Country/Region'] == country) {
        addedCases = parseInt(result[index]['Confirmed']) - parseInt(result[i]['Confirmed']);
        addedDeaths = parseInt(result[index]['Deaths']) - parseInt(result[i]['Deaths']);
        addedRecoveries = parseInt(result[index]['Recovered']) - parseInt(result[i]['Recovered']);
        break;
      }
    }
    for(var i = 0; i < countryData[index]; i++) {
      if(countryData[index][i]['ObservationDate'] == date) {
        countryData[index][i]['Confirmed'] = parseInt(countryData[index][i]['Confirmed']) - addedCases;
        countryData[index][i]['Deaths'] = parseInt(countryData[index][i]['Deaths']) - addedDeaths;
        countryData[index][i]['Recovered'] = parseInt(countryData[index][i]['Recovered']) - addedRecoveries;
        if(countryData[index][countryData[index].length-1]['casesDate'] == date || countryData[index][countryData[index].length-1]['deathsDate'] == date || countryData[index][countryData[index].length-1]['recoveredDate'] == date) {
          maxIndexCases = 0;
          maxIndexDeaths = 0;
          maxIndexRecovered = 0;
          //find peak data
          for(let j = 1; j < array.length-1; j++) {
            if(parseInt(countryData[index][maxIndexCases]['Confirmed']) < parseInt(countryData[index][j]['Confirmed'])) {
              maxIndexCases = j;
            }
            if(parseInt(countryData[index][maxIndexDeaths]['Deaths']) < parseInt(countryData[index][j]['Deaths'])) {
              maxIndexDeaths = j;
            }
            if(parseInt(countryData[index][maxIndexRecovered]['Recovered']) < parseInt(countryData[index][j]['Recovered'])) {
              maxIndexRecovered = j;
            }
          }
          countryData[index][countryData[index].length-1]['peakCases'] = countryData[index][maxIndexCases]['Confirmed'];
          countryData[index][countryData[index].length-1]['casesDate'] = countryData[index][maxIndexCases]['ObservationDate'];
          countryData[index][countryData[index].length-1]['peakDeaths'] = countryData[index][maxIndexDeaths]['Deaths'];
          countryData[index][countryData[index].length-1]['deathsDate'] = countryData[index][maxIndexDeaths]['ObservationDate'];
          countryData[index][countryData[index].length-1]['peakRecovered'] = countryData[index][maxIndexRecovered]['Recovered'];
          countryData[index][countryData[index].length-1]['recoveredDate'] = countryData[index][maxIndexRecovered]['ObservationDate'];
        }
      }
    }
  }
}

function deleteWorldData(date, confirmed, deaths, recoveries) {
  worldData[worldData.findIndex(x => x.Date === date)]['worldCases'] = parseInt(worldData[worldData.findIndex(x => x.Date === date)]['worldCases']) - parseInt(confirmed); 
  worldData[worldData.findIndex(x => x.Date === date)]['worldDeaths'] = parseInt(worldData[worldData.findIndex(x => x.Date === date)]['worldCases']) - parseInt(deaths); 
  worldData[worldData.findIndex(x => x.Date === date)]['worldRecovered'] = parseInt(worldData[worldData.findIndex(x => x.Date === date)]['worldCases']) - parseInt(recoveries); 
}