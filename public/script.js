

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


function CreateTable(arr_of_jsondata, div_id) {
    document.getElementById("showTable").innerHTML = "";
    
    function LengthOf(json) {
        //returns number of attributes in a json object
        return Object.keys(json).length
    }

    const front_json = arr_of_jsondata[0];
    let num_cols = LengthOf(front_json); // i.e., num of headers
    let num_rows = arr_of_jsondata.length + 1; // Extra row for header. Hence add 1 to length.
    const keys = Object.keys(front_json); //array of the json object's attributes

    const table = document.createElement("table");


    //Create Table Rows
    for (let i = 0; i < num_rows; ++i) {
        const tr = document.createElement('tr');
        table.appendChild(tr);


        //Create Table Columns
        for (let j = 0; j < num_cols; ++j) {   

            // first row of the table (header)
            if (i == 0) {
                const th = document.createElement('th');
                th.innerHTML = keys[j];
                tr.appendChild(th);
            }
            else {
                const td = document.createElement('td');
                const key = keys[j];

                // i-1 because of the extra header row
                td.innerHTML = arr_of_jsondata[i-1][key];

                tr.append(td);
            }
        }
    }
    
    let elem = document.getElementById(div_id);
    elem.appendChild(table);

}