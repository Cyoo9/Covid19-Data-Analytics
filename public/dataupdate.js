document.getElementById("insert-btn").onclick = () =>  {
    console.log("Clicked on insert button")
    const insert_country = document.getElementById("insertCountry").value;
    const insert_state = document.getElementById("insertState").value;
    const insert_date = document.getElementById("insertDate").value;
    const new_cases = document.getElementById("newCases").value;
    const new_deaths = document.getElementById("newDeaths").value;
    const new_recoveries = document.getElementById("newRecoveries").value;

    var params = "";
    params += `insertCountry=${insert_country}`;
    params += `&insertState=${insert_state}`;
    params += `&insertDate=${insert_date}`;
    params += `&newCases=${new_cases}`;
    params += `&newDeaths=${new_deaths}`;
    params += `&newRecoveries=${new_recoveries}`;

    let args = {
        endpoint: '/insert',
        method: 'POST',
        params: params,
        callback: (cb_args) => {

            ClearElementContentsById("insert-message");

            const h2 = document.createElement("h5");
            const h2_text = document.createTextNode("Successfully Inserted The Following Data:");
            const msg_container = document.getElementById("insert-message");
            const input_data = {
                Country : insert_country,
                "Province/State" : insert_state,
                Date : insert_date,
                Cases: new_cases,
                Deaths : new_deaths,
                Recovered : new_recoveries,
            };

            h2.appendChild(h2_text);
            msg_container.appendChild(h2);
            CreateTable([input_data], "insert-message");
            
        }
    }

    SendRequest(args);
    
};


document.getElementById("update-btn").onclick = () => {
    console.log("Clicked on update button")

    const update_sno = document.getElementById("updateSno").value;
    const update_country = document.getElementById("updateCountry").value;
    const update_state = document.getElementById("updateState").value;
    const update_date = document.getElementById("updateDate").value;
    const update_cases = document.getElementById("updateCases").value;
    const update_deaths = document.getElementById("updateDeaths").value;
    const update_recoveries = document.getElementById("updateRecoveries").value;


    var params = "";
    params += `updateSno=${update_sno}`;
    params += `&updateCountry=${update_country}`;
    params += `&updateState=${update_state}`;
    params += `&updateDate=${update_date}`;
    params += `&updateCases=${update_cases}`;
    params += `&updateDeaths=${update_deaths}`;
    params += `&updateRecoveries=${update_recoveries}`;

    let args = {
        endpoint: '/update',
        method: 'POST',
        params: params,
        callback: (cb_args) => {

            ClearElementContentsById("update-message");

            const h2 = document.createElement("h5");
            const h2_text = document.createTextNode("Successfully Updated");
            const msg_container = document.getElementById("update-message");
            const input_data = {
                "Serial Number" : update_sno,
                Country : update_country,
                "Province / State" : update_state,
                Date: update_date,
                Cases : update_cases,
                Deaths: update_deaths,
                Recovered : update_recoveries,
            };

            h2.appendChild(h2_text);
            msg_container.appendChild(h2);
            CreateTable([input_data], "update-message");
        },
    }

    SendRequest(args);


};

document.getElementById("delete-btn").onclick = () =>  {
    console.log("Clicked on delete button")

    const delete_sno = document.getElementById("deleteSno").value;
    const params = `deleteSno=${delete_sno}`;


    let args = {
        endpoint: '/delete',
        method: 'POST',
        params: params,
        callback: (cb_args) => {

            ClearElementContentsById("delete-message");

            const h2 = document.createElement("h5");
            const h2_text = document.createTextNode(`Successfully Deleted Serial Number ${delete_sno}`);
            const msg_container = document.getElementById("delete-message");
            h2.appendChild(h2_text);
            msg_container.appendChild(h2);
        }
    }

    SendRequest(args);

};

$(document).ready(function() {
    $('#updateOption').on('change', function () {
        if (this.value == ""){
            $("#insert-wrapper").hide();
            $("#delete-wrapper").hide();
            $("#update-wrapper").hide();
        }
        else if (this.value === "Insert") {
            $("#insert-wrapper").show();
            $("#delete-wrapper").hide();
            $("#update-wrapper").hide();
        }
        else if (this.value === "Delete") {
            $("#delete-wrapper").show();
            $("#insert-wrapper").hide();
            $("#update-wrapper").hide();
        }
        else if (this.value === "Update") {
            $("#update-wrapper").show();
            $("#insert-wrapper").hide();
            $("#delete-wrapper").hide();
        }
    });
});   