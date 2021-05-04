

function SendRequest(args) {

    /*
        args = {
            endpoint: ??,
            method: ??,
            params: 
            callback: (cb_args) => { some_func(cb_args) },
        };
    */
    
    let http = new XMLHttpRequest();

    http.open(args.method, args.endpoint, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = () => {

        if(http.readyState == 4 && http.status == 200) {
            args.callback({ response_text: http.responseText} );
        }
        
    }   
    http.send(args.params);
    return true;
}


function createTableFromJSON(jsonData) {
    var arrBirds = [];
    arrBirds = JSON.parse(jsonData); 	// Convert JSON to array.

    const want_confirmed_cases = document.getElementsByName('confirmedCases')[0].checked;
    const want_deaths = document.getElementsByName('deaths')[0].checked;
    const want_recoveries = document.getElementsByName('recoveries')[0].checked;



    var col = [];
    for (var i = 0; i < arrBirds.length; i++) {
        for (var key in arrBirds[i]) {
            if (col.indexOf(key) === -1) {
                if (key === "Confirmed" && !want_confirmed_cases) {
                    continue;
                }
                if (key === "Deaths" && !want_deaths) {
                    continue;
                }
                if (key === "Recovered" && !want_recoveries) {
                    continue;
                }

                col.push(key);
            }
        }
    }

    // Create a dynamic table.
    var table = document.createElement("table")// Create table header.

    var tr = table.insertRow(-1);                   // Table row.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // Table header.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }



    // Add JSON to the table rows.
    console.log(arrBirds.length);
    console.log(col.length);
    for (var i = 0; i < arrBirds.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);

                if (col[j] === 'Confirmed' && !want_confirmed_cases) {
                    tabCell.innerHTML = "";
                    continue;
                }
                if (col[j] === 'Deaths'  && !want_deaths) {
                    tabCell.innerHTML = "";
                    continue;
                }
                if (col[j] === 'Recoveries' && !want_recoveries) {
                    tabCell.innerHTML = "";
                    continue;
                }

                tabCell.innerHTML = arrBirds[i][col[j]];
                console.log( tabCell.innerHTML);
        }
    }

    // Finally, add the dynamic table to a container.
    var divContainer = document.getElementById("showTable");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
};

function createTableFromJSON__2(jsonData) {
    var arrBirds = [];
    arrBirds = JSON.parse(jsonData); 	// Convert JSON to array.


    var col = [];
    for (var i = 0; i < arrBirds.length; i++) {
        for (var key in arrBirds[i]) {
            if (col.indexOf(key) === -1) {
                if (key === "Confirmed" && !want_confirmed_cases) {
                    continue;
                }
                if (key === "Deaths" && !want_deaths) {
                    continue;
                }
                if (key === "Recovered" && !want_recoveries) {
                    continue;
                }

                col.push(key);
            }
        }
    }

    // Create a dynamic table.
    var table = document.createElement("table")// Create table header.

    var tr = table.insertRow(-1);                   // Table row.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // Table header.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }



    // Add JSON to the table rows.
    console.log(arrBirds.length);
    console.log(col.length);
    for (var i = 0; i < arrBirds.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);

                if (col[j] === 'Confirmed' && !want_confirmed_cases) {
                    tabCell.innerHTML = "";
                    continue;
                }
                if (col[j] === 'Deaths'  && !want_deaths) {
                    tabCell.innerHTML = "";
                    continue;
                }
                if (col[j] === 'Recoveries' && !want_recoveries) {
                    tabCell.innerHTML = "";
                    continue;
                }

                tabCell.innerHTML = arrBirds[i][col[j]];
                console.log( tabCell.innerHTML);
        }
    }

    // Finally, add the dynamic table to a container.
    var divContainer = document.getElementById("showTable");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
};