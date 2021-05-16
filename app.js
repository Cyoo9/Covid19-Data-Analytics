const express = require('express');
const app = express();
const fs = require('fs');
const server = 5000;
const path = require('path');
let ejs = require('ejs');

var bodyParser = require("body-parser");
var multer  = require('multer');
const {performance} = require('perf_hooks');

const { ap, all, of } = require('list');
const { ap, all, of, sort } = require('list');
const { parse } = require('path');
const { PassThrough } = require('stream');
var result = []; //holds all data
var searched_results = []; //holds data from a search
var outside_data = []; //holds data collected outside original file
var aggregatedCountryData = []; //holds data for each country aggregate totals
var worldData = []; //holds data for aggregate world totals
var countryData = []; //2D array holds non-cumulative data for each country


console.log("Starting Server...");

var resultCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data.csv')); //reads in a cvs file
result = csvParser(resultCSV); //put into usable array

var outsideCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/outside_metrics.csv')); //gathers outside metrics
outside_data = csvParser(outsideCSV); //put into usable array

var aggregateCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/aggregated_country_data.csv')); //aggregated data
aggregatedCountryData = csvParser(aggregateCSV); //put into usable array

var worldCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/world_data.csv')); //world data
worldData = csvParser(worldCSV); //put into usable array

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
  if (req.body.WantCases == "false" && req.body.WantDeaths == "false" && req.body.WantRecoveries == "false") {
    res.status(400).send("You must select at least one statistic");
  }
  else if (searched_results.length == 0) {
    res.status(400).send("No matching results were found");
  }
  else {
    res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  }

})

//called when import button is selected
app.post('/import', (req, res) => { 
  resultCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/covid_19_data_updated.csv')); //change filepath to updated csv
  result = csvParser(resultCSV); //reparse with updated csv file

  aggregateCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/aggregated_country_data_updated.csv')); //change filepath to updated csv
  aggregatedCountryData = csvParser(aggregateCSV); //reparse with updated csv file

  worldCSV = fs.readFileSync(path.resolve(__dirname, './CSV Files/world_data_updated.csv')); //change filepath to updated csv
  worldData = csvParser(worldCSV); //reparse with updated csv file

  countryData = createCountryData();

  res.send("Import complete. Search now on updated database");
})

//called in insert wrapper, uses middlewear to insert data into result array
app.post('/insert', InsertValidation, insertData, (req, res) => {

  if (res.locals.input_is_valid) {

    resultCSV = './CSV Files/covid_19_data_updated.csv';
    ConvertToCSV(result, resultCSV); //automatically backsup array for importing later
  
    aggregateCSV = './CSV Files/aggregated_country_data_updated.csv';
    ConvertToCSV(aggregatedCountryData, aggregateCSV);
  
    worldCSV = './CSV Files/world_data_updated.csv';
    ConvertToCSV(worldData, worldCSV);

    res.status(200).send();
  }
  else {
    res.status(400).send(res.locals.validation_response);
  }

})

//called in update wrapper, uses middlewear to update data in result array
app.post('/update', UpdateValidation ,updateData, (req, res) => {


  if (res.locals.input_is_valid) {
    resultCSV = './CSV Files/covid_19_data_updated.csv';
    ConvertToCSV(result, resultCSV); //automatically backsup array for importing later
  
    aggregateCSV = './CSV Files/aggregated_country_data_updated.csv';
    ConvertToCSV(aggregatedCountryData, aggregateCSV);
  
    worldCSV = './CSV Files/world_data_updated.csv';
    ConvertToCSV(worldData, worldCSV);

    res.status(200).send();
  }
  else {
    res.status(400).send(res.locals.validation_response);
  }
})

//called in delete wrapper, uses middlewear to delete data in result array
app.post('/delete', deleteData, (req, res) => {
  if (res.locals.input_is_valid) {
    resultCSV = './CSV Files/covid_19_data_updated.csv';
    ConvertToCSV(result, resultCSV); //automatically backsup array for importing later
  
    aggregateCSV = './CSV Files/aggregated_country_data_updated.csv';
    ConvertToCSV(aggregatedCountryData, aggregateCSV);
  
    worldCSV = './CSV Files/world_data_updated.csv';
    ConvertToCSV(worldData, worldCSV);

    res.status(200).send(res.locals.validation_response);
  }
  else {
    res.status(400).send(res.locals.validation_response);
  }
  
})

app.post('/Q1', (req, res) => {
  let t0 = performance.now();
  analytics1(req, res);
  let t1 = performance.now();
  console.log("Analytics 1 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q2', (req, res) => {
  let t0 = performance.now();
  analytics2(req, res);
  let t1 = performance.now();
  console.log("Analytics 2 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q3', (req, res) => {
  let t0 = performance.now();
  analytics3(req, res);
  let t1 = performance.now();
  console.log("Analytics 3 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q4', (req, res) => {
  let t0 = performance.now();
  analytics4(req, res);
  let t1 = performance.now();
  console.log("Analytics 4 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q5', (req, res) => {
  let t0 = performance.now();
  analytics5(req, res);
  let t1 = performance.now();
  console.log("Analytics 5 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q6', (req, res) => {
  let t0 = performance.now();
  analytics6(req, res);
  let t1 = performance.now();
  console.log("Analytics 6 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q7', (req, res) => {
  let t0 = performance.now();
  analytics7(req, res);
  let t1 = performance.now();
  console.log("Analytics 7 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.post('/Q8', (req, res) => {
  let t0 = performance.now();
  analytics8(req, res);
  let t1 = performance.now();
  console.log("Analytics 8 took " + (t1 - t0) + " milliseconds.");
}) //calls analytic 1 middlewear

app.listen(server, function() {
    console.log(`Server is running on port: ${server}`);
})

//Writes array of the average cases, deaths, and recoveries for each country
function analytics1(req, res, next) {
  let retArray = [];
  let obj = {};
  let avgCasesPerDay = "";
  let avgDeathsPerDay = "";
  let avgRecoveriesPerDay = "";
  //divide each aggregated metric by the number of dates recorded in order to get average
  for(let i = 0; i < aggregatedCountryData.length; i++) {
    avgCasesPerDay = parseInt(aggregatedCountryData[i]['Confirmed']) / parseInt(aggregatedCountryData[i]['numDates']);
    avgDeathsPerDay = parseInt(aggregatedCountryData[i]['Deaths']) / parseInt(aggregatedCountryData[i]['numDates']);
    avgRecoveriesPerDay = parseInt(aggregatedCountryData[i]['Recovered']) / parseInt(aggregatedCountryData[i]['numDates']);
    obj = { 'Country' : aggregatedCountryData[i]['Country'],
            'avgCasesPerDay' : avgCasesPerDay,
            'avgDeathsPerDay' : avgDeathsPerDay,
            'avgRecoveriesPerDay' : avgRecoveriesPerDay
          };
    retArray.push(obj); // push to array
  }

  fs.writeFileSync('./public/output.json', JSON.stringify(retArray)); //write array to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
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

  //skip if country not found
  if (array.length == 0) {
    res.status(400).send({ "msg" : `${country} was not found`});
    next();
  }
  else {
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
      }


<<<<<<< HEAD
=======
 
>>>>>>> fc0715d3a337a7e1e066e7710ba38d8635ace974
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
      array1 = JSON.parse(JSON.stringify(countryData[i]));
    }
    if(countryData[i][0]['Country'] == country2) {
      array2 = JSON.parse(JSON.stringify(countryData[i]));
    }
  }

  if (array1.length == 0 || array2.length == 0) {

    let response = {};

    if (array1.length == 0) {
      response["msg1"] = `${country1} was not found`;
    }
    if (array2.length == 0) {
      response["msg2"] = `${country2} was not found`;
    }

    res.status(400).send(response);
    next();
  }
  else {
    //combine arrays, front end will seperate the data into graphs
    for(let i = 0; i < array2.length; i++) {
      array1.push(array2[i]);
    }

    fs.writeFileSync('./public/output.json', JSON.stringify(array1)); //write to json
    res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  }



<<<<<<< HEAD
=======

>>>>>>> fc0715d3a337a7e1e066e7710ba38d8635ace974
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

  if (array.length == 0) {
    res.status(400).send({"msg" : `${country} was not found`});
    next();
  }
  else {
    //front end will handle how graph looks, send
    fs.writeFileSync('./public/output.json', JSON.stringify(array)); //write to json
    res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  }


<<<<<<< HEAD

=======
>>>>>>> fc0715d3a337a7e1e066e7710ba38d8635ace974
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
      res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
    }
    else {
      res.status(400).send({"msg" : `${country} was not found`});
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
    res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  }
<<<<<<< HEAD
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json

=======
  
  next();
>>>>>>> fc0715d3a337a7e1e066e7710ba38d8635ace974
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
  else if (req.body.statType == "Recoveries") {
    //sort by recoveries
    sortType = 'Recovered';
  }  
  else {
    sortType = undefined;
  }

  if (sortType == undefined) {
    res.status(400).send({"msg" : `${req.body.statType} is not a valid statistic`});
  }
  else {
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
  }

<<<<<<< HEAD
  fs.writeFileSync('./public/output.json', JSON.stringify(topTen)); //write to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
=======

  next();
>>>>>>> fc0715d3a337a7e1e066e7710ba38d8635ace974
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
      array = JSON.parse(JSON.stringify(countryData[i]));
      break;
    }
  }

  let date = "";
  let peak = "";

  //all peaks are stored in last object of non-cumulative data; retrieve
  if (array.length != 0) {
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
  }


  const statistic_is_valid = (stat == "Confirmed" || stat == "Deaths" || stat == "Recovered");

  if (array.length == 0 ||  !statistic_is_valid ) {

    let response = {};
    
    if (array.length == 0) {
      response["msg1"] = `${country} was not found`;
    }

    if (!statistic_is_valid) {
      response["msg2"] = `${stat} is not a valid statistic`;
    }

    res.status(400).send(response);
  }
  else {
    //create object
    var obj = {'Country' : country,
              'Peak Date' : date
              };
    obj[stat] = peak;
    array.splice(array.length-2, 2);
    array.push(obj); //push to end of array for front end, along with usable graph data (not last two objects)
    fs.writeFileSync('./public/output.json', JSON.stringify(array)); //write to json
    res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json
  }

<<<<<<< HEAD
  //create object
  var obj = {'Country' : country,
            'Peak Date' : date
            };
  obj[stat] = peak;
  array.splice(array.length-2, 2);
  array.push(obj); //push to end of array for front end, along with usable graph data (not last two objects)
  fs.writeFileSync('./public/output.json', JSON.stringify(array)); //write to json
  res.sendFile(path.join(__dirname, "/public" , "output.json")); //send json

=======

  next();
>>>>>>> fc0715d3a337a7e1e066e7710ba38d8635ace974
}

//outputs cumulative totals for world data
function analytics8(req, res, next) {
  fs.writeFileSync('./public/output.json', JSON.stringify(worldData)); 
  res.sendFile(path.join(__dirname, "/public" , "output.json"));

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
                let data = JSON.parse( JSON.stringify(result[i]) ); //deep copy
                

                if (req.body.WantCases == "false") {
                  delete data.Confirmed;
                }

                if (req.body.WantDeaths == "false") {
                  delete data.Deaths;
                }

                if (req.body.WantRecoveries == "false") {
                  delete data.Recovered;
                }

                searched_results.push(data);
              }
            }
          }
        }
      }
    }
  }

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
  InsertAggregate(req.body.insertCountry, req.body.insertState, req.body.insertDate, req.body.newCases, req.body.newDeaths, req.body.newRecoveries);

  //pushes new insert
  result.push(obj);

  next();
}

function InsertValidation(req, res, next) {
  console.log(req.body);

  let response = {
    country : "",
    state : "",
    cases : "",
    deaths : "",
    recoveries : "",
  }

  const country_is_valid = new RegExp("^[^0-9]+$").test(req.body.insertCountry);
  const state_is_valid = new RegExp("^[^0-9]*$").test(req.body.insertState);
  const cases_is_valid =  new RegExp("^[0-9]+$").test(req.body.newCases);
  const deaths_is_valid =  new RegExp("^[0-9]+$").test(req.body.newDeaths);
  const recoveries_is_valid =  new RegExp("^[0-9]+$").test(req.body.newRecoveries);




  if (!country_is_valid) {
    if (req.body.insertCountry == "") {
      response.country = "Your country field cannot be empty";
    }
    else {
      response.country = "Your inserted country must not contain numbers";
    }
  }

  if (!state_is_valid) {
      response.state = "Your Province/State must not contain numbers";
  }

  if (!cases_is_valid) {
    if (req.body.newCases == "") {
      response.cases = "Your number of cases cannot be empty"
    }
    else {
      response.cases = "Your number of cases can only have numbers"
    }
  }

  if (!deaths_is_valid) {
    if (req.body.newDeaths == "") {
      response.deaths = "Your number of deaths cannot be empty"
    } 
    else {
      response.deaths = "Your number of deaths can only have numbers"
    }
  }

  if (!recoveries_is_valid) {
    if (req.body.newRecoveries == "") {
      response.recoveries = "Your number of recoveries cannot be empty"
    }
    else {
      response.recoveries = "Your number of recoveries can only have numbers"
    }
    
  }

  res.locals.input_is_valid = country_is_valid && state_is_valid && 
                              cases_is_valid && deaths_is_valid && recoveries_is_valid;
  
  res.locals.validation_response = response;

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

  let country, date, state, confirmed, deaths, recoveries;
  //updates data at given SNo if the SNo exists
  var index = result.findIndex(x => x.SNo === req.body.updateSno);
  if(index != -1) {
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

    InsertWorldData(req.body.updateCountry, req.body.updateState, req.body.updateDate, req.body.updateCases, req.body.updateDeaths, req.body.updateRecoveries);
    Insert2D(req.body.updateCountry, req.body.updateState, req.body.updateDate, req.body.updateCases, req.body.updateDeaths, req.body.updateRecoveries);
    InsertAggregate(req.body.updateCountry, req.body.updateState, req.body.updateDate, req.body.updateCases, req.body.updateDeaths, req.body.updateRecoveries);

    let obj = {};
    obj['SNo'] = req.body.updateSno;
    obj['ObservationDate'] = req.body.updateDate;
    obj['Province/State'] = req.body.updateState;
    obj['Country/Region'] = req.body.updateCountry;
    obj['Last Update'] = datetime;
    obj['Confirmed'] = req.body.updateCases;
    obj['Deaths'] = req.body.updateDeaths;
    obj['Recovered'] = req.body.updateRecoveries;
    result.splice(index, 0, obj);
  }
  next();
}

function UpdateValidation(req, res, next) {
  console.log(req.body);

  let response = {
    serial_number : "",
    country : "",
    state : "",
    cases : "",
    deaths : "",
    recoveries : "",
  }

  const serial_number_is_valid = new RegExp("^[0-9]+$").test(req.body.updateSno);
  const country_is_valid = new RegExp("^[^0-9]+$").test(req.body.updateCountry);
  const state_is_valid = new RegExp("^[^0-9]*$").test(req.body.updateState);
  const cases_is_valid =  new RegExp("^[0-9]+$").test(req.body.updateCases);
  const deaths_is_valid =  new RegExp("^[0-9]+$").test(req.body.updateDeaths);
  const recoveries_is_valid =  new RegExp("^[0-9]+$").test(req.body.updateRecoveries);


  if (!serial_number_is_valid) {
    if (req.body.updateSno == "") {
      response.serial_number = "Your serial number cannot be empty"
    }
    else {
      response.serial_number = "Your serial number must only contain numbers"
    }

  }


  if (!country_is_valid) {
    if (req.body.updateCountry == "") {
      response.country = "Your country field cannot be empty";
    }
    else {
      response.country = "Your inserted country must not contain numbers";
    }
  }

  if (!state_is_valid) {
      response.updateState = "Your Province/State must not contain numbers";
  }

  if (!cases_is_valid) {
    if (req.body.updateCases == "") {
      response.cases = "Your number of cases cannot be empty"
    }
    else {
      response.cases = "Your number of cases can only have numbers"
    }
  }

  if (!deaths_is_valid) {
    if (req.body.updateDeaths == "") {
      response.deaths = "Your number of deaths cannot be empty"
    } 
    else {
      response.deaths = "Your number of deaths can only have numbers"
    }
  }

  if (!recoveries_is_valid) {
    if (req.body.updateRecoveries == "") {
      response.recoveries = "Your number of recoveries cannot be empty"
    }
    else {
      response.recoveries = "Your number of recoveries can only have numbers"
    }
    
  }

  res.locals.input_is_valid = serial_number_is_valid && country_is_valid && state_is_valid && 
                              cases_is_valid && deaths_is_valid && recoveries_is_valid;

  res.locals.validation_response = response;

  next();
}

//deletes data in result array
function deleteData(req, res, next) {
  //deletes data at given SNo if SNo exists

  let to_be_deleted = {};
  let country, date, state, index, confirmed, deaths, recoveries; 

  if(result.findIndex(x => x.SNo === req.body.deleteSno) != -1) {

    index = result.findIndex(x => x.SNo === req.body.deleteSno);

    country = result[index]['Country/Region'];
    date = result[index]['ObservationDate'];
    state = result[index]['Province/State'];

    confirmed = result[index]['Confirmed'];
    deaths = result[index]['Deaths'];
    recoveries = result[index]['Recovered'];

    to_be_deleted["Serial Number"] = req.body.deleteSno;
    to_be_deleted["country"] = country;
    to_be_deleted["date"] = date;
    to_be_deleted["state"] = state;
    to_be_deleted["confirmed"] = confirmed;
    to_be_deleted["deaths"] = deaths;
    to_be_deleted["recoveries"] = recoveries;

    

    deleteAggregate(country, date, state, confirmed, deaths, recoveries);
    delete2D(country, date, state);
    deleteWorldData(date, confirmed, deaths, recoveries);
    result.splice(index, 1); //removes from array
    res.locals.input_is_valid = true;
    res.locals.validation_response = to_be_deleted;
  }
  else {
    res.locals.input_is_valid = false;
    res.locals.validation_response = { serial_number : "Your serial number is invalid" };
  }

  next();
}


//converts an array to a csv file called covid_19_data_updated.csv
function ConvertToCSV(objArray, csvfile) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray; //gets array

  var keyArray = Object.keys(array[0]);
  let str = "";
  for(var i = 0; i < keyArray.length; i++) {
    if(i == keyArray.length-1) {
      str += keyArray[i] + "\r\n";
    }
    else {
      str += keyArray[i] + ",";
    }
  }

  //adds each value from each array object, sperated by commas
  var line = '';
  for (var i = 0; i < array.length; i++) {
    line = '';
    for (var index in array[i]) {
      if(index == keyArray[keyArray.length-1]) {
        line += array[i][index];
      }
      else {
        if(array[i][index].toString().includes(',')) { 
          line += '\"' + array[i][index] + '\"' + ',';
        }
        else {
          line += array[i][index] + ',';
        }
      }
    }
    str += line + '\r\n';
  }
  fs.writeFileSync(csvfile, str); //writes to file
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
    countryData[countryIndex].splice(countryData[countryIndex].length-2, 2);;
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

function InsertAggregate (country, state, date, cases, deaths, recoveries) {
  let index = -1;
  for(let i = 0; i < aggregatedCountryData.length; i++) {
    if(aggregatedCountryData[i]['Country'] == country) {
      index = i;
      break;
    }
  }
  if(index != -1) {
    if(state == "") {
      for(var i = result.length-1; i >= 0; i--) {
        if(result[i]['Country/Region'] == country) {
          if(date > ReformatDate(result[i]['ObservationDate'])) {
            aggregatedCountryData[index]["Confirmed"] = cases;
            aggregatedCountryData[index]["Deaths"] = deaths;
            aggregatedCountryData[index]["Recovered"] = recoveries;
            break;
          }
          else {
            break;
          }
        }
      }
      aggregatedCountryData[index]["numDates"] = parseInt(aggregatedCountryData[index]["numDates"]) + 1;
    }
    else {
      var addDate = true;
      for(var i = 0; i < result.length; i++) {
        if(country == result[i]['Country/Region'] && date == ReformatDate(result[i]['ObservationDate']) && state != result[i]['Province/State']) {
          addDate = false;
        }
      }
      for(var i = result.length-1; i >= 0; i--) {
        if(result[i]['Country/Region'] == country) {
          if(date > ReformatDate(result[i]['ObservationDate'])) {
            aggregatedCountryData[index]["Confirmed"] = cases;
            aggregatedCountryData[index]["Deaths"] = deaths;
            aggregatedCountryData[index]["Recovered"] = recoveries;
            break;
          }
          else if (date == ReformatDate(result[i]['ObservationDate'])){
            aggregatedCountryData[index]["Confirmed"] = parseInt(aggregatedCountryData[index]["Confirmed"]) + parseInt(cases);
            aggregatedCountryData[index]["Deaths"] = parseInt(aggregatedCountryData[index]["Deaths"]) + parseInt(deaths);
            aggregatedCountryData[index]["Recovered"] = parseInt(aggregatedCountryData[index]["Recovered"]) + parseInt(recoveries);
            break;
          }
          else {
            break;
          }
        }
      }
      if(addDate) {
        aggregatedCountryData[index]["numDates"] = parseInt(aggregatedCountryData[index]["numDates"]) + 1;
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

function deleteAggregate(country, date, state, cases, deaths, recoveries) {
  let index = -1;
  for(let i = 0; i < aggregatedCountryData.length; i++) {
    if(aggregatedCountryData[i]['Country'] == country) {
      index = i;
      break;
    }
  }
  if(index != -1) {
    if(state == "") {
      for(var i = result.length-1; i >= 0; i--) {
        if(result[i]['Country/Region'] == country) {
          if(date == ReformatDate(result[i]['ObservationDate'])) {
            for(var j = i-1; j >= 0; j--) {
              if(result[j]['Country/Region'] == country) {
                aggregatedCountryData[index]["Confirmed"] = result[j]["Confirmed"];
                aggregatedCountryData[index]["Deaths"] = result[j]["Deaths"];
                aggregatedCountryData[index]["Recovered"] = result[j]["Recovered"];
                aggregatedCountryData[index]["numDates"] = parseInt(aggregatedCountryData[index]["numDates"]) - 1;
                break;
              }
            }
            break;
          }
          else {
            aggregatedCountryData[index]["numDates"] = parseInt(aggregatedCountryData[index]["numDates"]) - 1;
            break;
          }
        }
      }
    }
    else {
      var minusDate = true;
      for(var i = 0; i < result.length; i++) {
        if(country == result[i]['Country/Region'] && date == ReformatDate(result[i]['ObservationDate']) && state != result[i]['Province/State']) {
          minusDate = false;
        }
      }
      for(var i = result.length-1; i >= 0; i--) {
        if(result[i]['Country/Region'] == country) {
          if (date == ReformatDate(result[i]['ObservationDate'])){
            aggregatedCountryData[index]["Confirmed"] = parseInt(aggregatedCountryData[index]["Confirmed"]) - parseInt(cases);
            aggregatedCountryData[index]["Deaths"] = parseInt(aggregatedCountryData[index]["Deaths"]) - parseInt(deaths);
            aggregatedCountryData[index]["Recovered"] = parseInt(aggregatedCountryData[index]["Recovered"]) - parseInt(recoveries);
            if(parseInt(aggregatedCountryData[index]["Confirmed"]) == 0 && parseInt(aggregatedCountryData[index]["Deaths"]) == 0 && parseInt(aggregatedCountryData[index]["Recovered"]) == 0) {
              var dateFound = false;
              var dateToAggregate = '';
              var totalCases = 0;
              var totalDeaths = 0;
              var totalRecovered = 0;
              for(var j = i-1; j >= 0; j--) {
                if(dateFound && result[j]['Country/Region'] == country) {
                  totalCases += parseInt(result[j]['Confirmed']);
                  totalDeaths += parseInt(result[j]['Deaths']);
                  totalRecovered += parseInt(result[j]['Recovered']);
                }
                if(result[j]['Country/Region'] == country && !dateFound) {
                  dateFound = true;
                  dateToAggregate = result[j]['ObservationDate'];
                  totalCases = parseInt(result[j]['Confirmed']);
                  totalDeaths = parseInt(result[j]['Deaths']);
                  totalRecovered = parseInt(result[j]['Recovered']);
                }
              }
              aggregatedCountryData[index]["Confirmed"] = totalCases;
              aggregatedCountryData[index]["Deaths"] = totalDeaths;
              aggregatedCountryData[index]["Recovered"] = totalRecovered;
            }
            break;
          }
          else {
            break;
          }
        }
      }
      if(minusDate) {
        aggregatedCountryData[index]["numDates"] = parseInt(aggregatedCountryData[index]["numDates"]) - 1;
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
      for(let j = 1; j < countryData[index].length-1; j++) {
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
    var addedCases = parseInt(result[resultIndex]['Confirmed']);
    var addedDeaths = parseInt(result[resultIndex]['Deaths']);
    var addedRecoveries = parseInt(result[resultIndex]['Recovered']);
    for(var i = resultIndex-1; i >= 0; i--) {
      if(result[i]['Province/State'] == state && result[i]['Country/Region'] == country) {
        addedCases = addedCases - parseInt(result[i]['Confirmed']);
        addedDeaths = addedDeaths - parseInt(result[i]['Deaths']);
        addedRecoveries = addedRecoveries - parseInt(result[i]['Recovered']);
        break;
      }
    }
    for(var i = 0; i < countryData[index].length; i++) {
      if(countryData[index][i]['ObservationDate'] == date) {
        countryData[index][i]['Confirmed'] = parseInt(countryData[index][i]['Confirmed']) - addedCases;
        countryData[index][i]['Deaths'] = parseInt(countryData[index][i]['Deaths']) - addedDeaths;
        countryData[index][i]['Recovered'] = parseInt(countryData[index][i]['Recovered']) - addedRecoveries;
        if(countryData[index][countryData[index].length-1]['casesDate'] == date || countryData[index][countryData[index].length-1]['deathsDate'] == date || countryData[index][countryData[index].length-1]['recoveredDate'] == date) {
          maxIndexCases = 0;
          maxIndexDeaths = 0;
          maxIndexRecovered = 0;
          //find peak data
          for(let j = 1; j < countryData[index].length-1; j++) {
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
        break;
      }
    }
  }
}

function deleteWorldData(date, confirmed, deaths, recoveries) {
  var index = worldData.findIndex(x => x.Date === date);
  worldData[index]['worldCases'] = parseInt(worldData[index]['worldCases']) - parseInt(confirmed); 
  worldData[index]['worldDeaths'] = parseInt(worldData[index]['worldDeaths']) - parseInt(deaths); 
  worldData[index]['worldRecovered'] = parseInt(worldData[index]['worldRecovered']) - parseInt(recoveries); 
}

/*var changeAggregate = false;
  var index = aggregatedCountryData.findIndex(x => x.Country === country);
  for(let i = result.length-1; i >= 0; i--) {
    if(result[i]['Country/Region'] == country) {
      if(changeAggregate) {
        if(state == "") {
          console.log("oops?");
          aggregatedCountryData[index]['Confirmed'] = result[i]['Confirmed'];
          aggregatedCountryData[index]['Deaths'] = result[i]['Deaths'];
          aggregatedCountryData[index]['Recovered'] = result[i]['Recovered'];
          aggregatedCountryData[index]['numDates'] = parseInt(aggregatedCountryData[index]['numDates'])-1;
        }
        else {
          console.log("we made it");
          aggregatedCountryData[index]['Confirmed'] = parseInt(aggregatedCountryData[index]['Confirmed']) - parseInt(confirmed);
          aggregatedCountryData[index]['Deaths'] = parseInt(aggregatedCountryData[index]['Deaths']) - parseInt(deaths);
          aggregatedCountryData[index]['Recovered'] = parseInt(aggregatedCountryData[index]['Recovered']) - parseInt(recoveries);
          if(parseInt(aggregatedCountryData[index]['Confirmed']) == 0 || parseInt(aggregatedCountryData[index]['Deaths']) == 0 || parseInt(aggregatedCountryData[index]['Recovered']) == 0) {
            aggregatedCountryData[index]['Confirmed'] = result[i]['Confirmed'];
            aggregatedCountryData[index]['Deaths'] = result[i]['Deaths'];
            aggregatedCountryData[index]['Recovered'] = result[i]['Recovered'];
            aggregatedCountryData[index]['numDates'] = parseInt(aggregatedCountryData[index]['numDates'])-1;
          }
        }
        break;
      }
      if(result[i]['ObservationDate'] == date) {
        console.log("did we get here?");
        changeAggregate = true;
      }
      else {
        if(state == "") {
          aggregatedCountryData[index]['numDates'] = parseInt(aggregatedCountryData[index]['numDates'])-1;
        }
        break;
      }
    }
  }*/