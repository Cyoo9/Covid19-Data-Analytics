

function update(value){
    if (value.length ==0) document.getElementById("state").innerHTML = 
    "<option></option>";
    else {
        var stateoptions = "";
        for (stateName in provincesbyCountry[value]){
            stateoptions += "<option>" + provincesbyCountry[value][stateName] + "</option>";
        }
        document.getElementById("state").innerHTML =stateoptions;
    }
}




document.getElementById("import-btn").onclick = () =>  {
                
    console.log("Clicked on import button")

    let args = {
        endpoint: '/import',
        method: 'POST',
        params: `import-btn-clicked=true`,
        callback: () => {},
    }

    SendRequest(args);

};

document.getElementById("loadMore").onclick = () => {

    event.preventDefault();

    const country = document.getElementById('country').value;
    const state = document.getElementById('state').value;
    const date = document.getElementById('date').value;
    const numCases = document.getElementById("confirmed-cases").value;
    const numDeaths = document.getElementById("deaths").value;
    const numRecovered = document.getElementById("recoveries").value;
    const cases_checkbox = document.getElementById("cases-checkbox").checked;
    const deaths_checkbox = document.getElementById("deaths-checkbox").checked;
    const recoveries_checkbox = document.getElementById("recoveries-checkbox").checked;



    var params = "";
    params += `country=${country}`;
    params += `&state=${state}`;
    params += `&date=${date}`;
    params += `&Confirmed=${numCases}`;
    params += `&Deaths=${numDeaths}`;
    params += `&Recovered=${numRecovered}`;
    params += `&WantCases=${cases_checkbox}`;
    params += `&WantDeaths=${deaths_checkbox}`;
    params += `&WantRecoveries=${recoveries_checkbox}`;

    let args = {
        endpoint: '/search',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);

            CreateTable(response_arr, "showTable");
        },

        OnClientError: (args) => {

            const div = document.getElementById("showTable");
            const h5 = document.createElement("h5");

            h5.innerHTML = "Failed To Search";
            div.appendChild(h5);
            

            CreateErrorMessage({"msg" : args.response_text}, "showTable");

        },
    }

    ClearElementContentsById("showTable");
    SendRequest(args);

}

