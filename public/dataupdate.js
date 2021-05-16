

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
     

            const h5 = document.createElement("h5");
            const h5_text = document.createTextNode("Successfully Inserted The Following Data:");
            const msg_container = document.getElementById("insert-message");
            const input_data = {
                Country : insert_country,
                "Province/State" : insert_state,
                Date : insert_date,
                Cases: new_cases,
                Deaths : new_deaths,
                Recovered : new_recoveries,
            };

            h5.appendChild(h5_text);
            msg_container.appendChild(h5);
            CreateTable([input_data], "insert-message");
            
        },

        OnClientError: (args) => {
            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("insert-message");

            h5.innerHTML = "Failed to insert data:";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "insert-message");
        },
    }

    ClearElementContentsById("insert-message");
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

        

            const h5 = document.createElement("h5");
            const h5_text = document.createTextNode("Successfully Updated");
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

            h5.appendChild(h5_text);
            msg_container.appendChild(h5);
            CreateTable([input_data], "update-message");
        },

        OnClientError : (args) => {
            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");   
            const msg_container = document.getElementById("update-message");

            h5.innerHTML = "Failed To Update";
            msg_container.appendChild(h5);
            CreateErrorMessage(server_response, "update-message");
        }
    }

    ClearElementContentsById("update-message");
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

            console.log(cb_args.response_text);
            const server_response = JSON.parse(cb_args.response_text);
            
            const h5 = document.createElement("h5");
            const h5_text = document.createTextNode(`Successfully Deleted Serial Number ${delete_sno}`);
            const msg_container = document.getElementById("delete-message");
            h5.appendChild(h5_text);
            msg_container.appendChild(h5);

            CreateTable([server_response], "delete-message");
        },

        OnClientError : (args) => {
            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");   
            const msg_container = document.getElementById("delete-message");

            h5.innerHTML = "Failed To Delete";
            msg_container.appendChild(h5);
            CreateErrorMessage(server_response, "delete-message");
        }
    }

    ClearElementContentsById("delete-message");
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