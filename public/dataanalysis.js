
$(document).ready(function() {
    $('#updateOption').on('change', function () {
        if (this.value == ""){
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q1") {
            $("#Q1-wrapper").show();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q2") {
            $("#Q2-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q3") {
            $("#Q3-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q4") {
            $("#Q4-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q5") {
            $("#Q5-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q6") {
            $("#Q6-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q7-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q7") {
            $("#Q7-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q8-wrapper").hide();
        }
        else if (this.value === "Q8") {
            $("#Q8-wrapper").show();
            $("#Q1-wrapper").hide();
            $("#Q2-wrapper").hide();
            $("#Q3-wrapper").hide();
            $("#Q4-wrapper").hide();
            $("#Q5-wrapper").hide();
            $("#Q6-wrapper").hide();
            $("#Q7-wrapper").hide();
        }
    });
});     

let charts = {
    'Q1' : [],
    'Q2' : [],
    'Q3' : [],
    'Q4' : [],
    'Q5' : [],
    'Q6' : [],
    'Q7' : [],
    'Q8' : [],
};

function DestroyCharts(chart_name) {

    console.log(chart_name);
    if (charts[chart_name] == undefined) {
        return;
    }

    for (let i = 0; i < charts[chart_name].length; ++i) {
        charts[chart_name][i].destroy();
    }


}

document.getElementById("Q1-btn").onclick = () =>  {
    console.log("Clicked on Q1 button")
    
    let args = {
        endpoint: '/Q1',
        method: 'POST',
        params: '',
        callback: (cb_args) => { 
            let response_arr = JSON.parse(cb_args.response_text);
            ClearElementContentsById("showTable");
            CreateTable(response_arr, "showTable");
        },
    }

    SendRequest(args);
    
};


document.getElementById("Q2-btn").onclick = () =>  {

    console.log("Clicked on Q2 button");

    const input = document.getElementById("q2Country").value;
    const params = `Country=${input}`;

    let args = {
        endpoint: '/Q2',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);
            console.log(response_arr);
            let country = response_arr[0].Country;
            console.log(country);
            let avgcasesbefore;
            let avgcasesafter;
            let avgdeathsbefore;
            let avgdeathsafter;
            let avgrecoverbefore;
            let avgrecoverafter;
            let vaccine;
            let vaxDate;

            avgcasesbefore = response_arr[0].avgCasesBeforeVax;
            console.log(avgcasesbefore);
            avgcasesafter = (response_arr[0].avgCasesAfterVax);
            avgdeathsbefore = (response_arr[0].avgDeathsBeforeVax);
            avgdeathsafter = (response_arr[0].avgDeathsAfterVax);
            avgrecoverbefore = (response_arr[0].avgRecoveriesBeforeVax);
            avgrecoverafter= (response_arr[0].avgRecoveriesAfterVax);      
            vaccine = (response_arr[0].VaccineName);      
            vaxDate = (response_arr[0].VaccineDate);    
            
            var vaxInfo = `Country: ${input}; ` + " Distributed Vaccine: " + vaccine + ";  Vaccine Start Date: " + vaxDate;
            var divContainer = document.getElementById("Q2-message");
            divContainer.innerHTML = vaxInfo;

            let data = {
                labels: ['Avg. Cases Before', 
                'Avg. Cases After', 
                'Avg. Deaths Before', 
                'Avg. Deaths After', 
                'Avg. Recoveries Before', 
                'Avg. Recoveries After'],
                datasets: [{

                        label: "Averages",
                        data: [avgcasesbefore, avgcasesafter, avgdeathsbefore, avgdeathsafter, avgrecoverbefore, avgrecoverafter],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                        ],
                        borderColor: [
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                        ],
                        borderWidth: 1,
                        lineTension: 0.7,
                    }]

            };

            const config = {
                type: 'bar',
                data: data,
                options: {
                    plugins : {
                        title: {
                            display: true,
                            text: `Effects of the Vaccine in ${input}`,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                },
            };

            

            charts.Q2.push( new Chart(
                document.getElementById('q2-chart'),
                config
            ));  

        },

        OnClientError: (args) => {

            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("Q2-message");

            h5.innerHTML = "Failed To Show Chart";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "Q2-message");

        }
    }

    DestroyCharts("Q2");
    ClearElementContentsById("Q2-message");
    SendRequest(args);

};

document.getElementById("Q3-btn").onclick = () =>  {

    console.log("Clicked on Q3 button")
    const input = document.getElementById("q3country").value;
    const input2 = document.getElementById("q3country2").value;

    var params = "";
    params += `country1=${input}`,
    params += `&country2=${input2}`;


    let args = {
        endpoint: '/Q3',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);

            let country1 = input;
            let country2 = input2;

            let countries1 = [];
            let observation_dates1 = [];
            let confirmed_cases1 = [];
            let deaths1 = [];
            let recoveries1 = [];

            let countries2 = [];
            let observation_dates2 = [];
            let confirmed_cases2 = [];
            let deaths2 = [];
            let recoveries2 = [];

            for (let i = 0; i < response_arr.length; ++i) {

  
                if (response_arr[i].Country == country1) {
                    observation_dates1.push(response_arr[i].ObservationDate);
                    confirmed_cases1.push(Math.max(0, response_arr[i].Confirmed));
                    deaths1.push(response_arr[i].Deaths);
                    recoveries1.push(Math.max(0,response_arr[i].Recovered));
                }
                else {
                    observation_dates2.push(response_arr[i].ObservationDate);
                    confirmed_cases2.push(Math.max(0, response_arr[i].Confirmed));
                    deaths2.push(response_arr[i].Deaths);
                    recoveries2.push(Math.max(0,response_arr[i].Recovered));
                }

            }

            let data1 = {
                labels: observation_dates1,
                datasets: [
                    {
                    label: "Confirmed Cases",
                    backgroundColor: 'rgb(235, 235, 52)',
                    borderColor: 'rgb(235, 235, 52)',
                    data: confirmed_cases1,
                    lineTension: 0.7,
                    },
                    {
                        label: "Confirmed Cases 2",
                        backgroundColor: 'rgb(255, 140, 0)',
                        borderColor: 'rgb(255, 140, 0)',
                        data: confirmed_cases2,
                        lineTension: 0.7,
                        },
                    {
                    label: "Deaths",
                    backgroundColor: 'rgb(46, 139, 87)',
                    borderColor: 'rgb(46, 139, 87)',
                    data: deaths1,
                    lineTension: 0.7, 
                    },
                    {
                        label: "Deaths2",
                        backgroundColor: 'rgb(215, 99, 132)',
                        borderColor: 'rgb(215, 99, 132)',
                        data: deaths2,
                        lineTension: 0.7, 
                        },
                    {
                    label: "Recoveries",
                    backgroundColor: 'rgb(66, 155, 245)',
                    borderColor: 'rgb(66, 155, 245)',
                    data: recoveries1,
                    lineTension: 0.7, 
                    },
                    {
                        label: "Recoveries2",
                        backgroundColor: 'rgb(128, 0, 128)',
                        borderColor: 'rgb(128, 0, 128)',
                        data: recoveries2,
                        lineTension: 0.7, 
                        },
                ]
            };   

            // let data2 = {
            //     labels: observation_dates2,
            //     datasets: [
            //         {
            //         label: "Confirmed Cases",
            //         backgroundColor: 'rgb(235, 235, 52)',
            //         borderColor: 'rgb(235, 235, 52)',
            //         data: confirmed_cases2,
            //         lineTension: 0.7,
            //         },
            //         {
            //         label: "Deaths",
            //         backgroundColor: 'rgb(255, 99, 132)',
            //         borderColor: 'rgb(255, 99, 132)',
            //         data: deaths2,
            //         lineTension: 0.7, 
            //         },
            //         {
            //         label: "Recoveries",
            //         backgroundColor: 'rgb(66, 155, 245)',
            //         borderColor: 'rgb(66, 155, 245)',
            //         data: recoveries2,
            //         lineTension: 0.7, 
            //         },
            //     ]
            // }; 

            const config1 = {
                type: 'line',
                data : data1,
                options: {
                    plugins : {
                        title: {
                            display: true,
                            text: [`Country 1: `, country1, `Country 2: ` , country2]
                        },
                    },
                    elements: {
                        point:{
                            radius: 0
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },

            };
            // const config2 = {
            //     type: 'line',
            //     data : data2,
            //     options: {
            //         plugins : {
            //             title: {
            //                 display: true,
            //                 text: country2,
            //             },
            //         },
            //         elements: {
            //             point:{
            //                 radius: 0
            //             }
            //         },
            //         responsive: true,
            //         maintainAspectRatio: false,
            //     },

            // };

            
    
            var q3_chart1 = new Chart(
                document.getElementById('q3-chart'),
                config1
            );     

            // var q3_chart2 = new Chart(
            //     document.getElementById('q3-chart2'),
            //     config2
            // );     

            charts.Q3.push(q3_chart1);
            // charts.Q3.push(q3_chart2);


        },

        OnClientError: (args) => {

            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("Q3-message");

            h5.innerHTML = "Failed To Show Charts";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "Q3-message");

        }
    }

    ClearElementContentsById("Q3-message");
    DestroyCharts("Q3");
    SendRequest(args);

    
};



document.getElementById("Q4-btn").onclick = () =>  {
    console.log("Clicked on Q4 button")

    const input = document.getElementById("q4country").value;
    var params = `Country=${input}`;

    let args = {
        endpoint: '/Q4',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);

            let country = response_arr[0].Country;
            let observation_dates = [];
            let confirmed_cases = [];
            let deaths = [];

            for (let i = 0; i < response_arr.length; ++i) {
                observation_dates.push(response_arr[i].ObservationDate);
                confirmed_cases.push(response_arr[i].Confirmed);
                deaths.push(response_arr[i].Deaths);
            }

            let data = {
                labels: observation_dates,
                datasets: [
                    {
                    label: "Confirmed Cases",
                    yAxisID: 'y1',
                    backgroundColor: 'rgb(235, 235, 52)',
                    borderColor: 'rgb(235, 235, 52)',
                    data: confirmed_cases,
                    lineTension: 0.4,
                    },
                    {
                    label: "Deaths",
                    yAxisID: 'y2',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: deaths,
                    lineTension: 0.4, 
                    },
                ]
            };   

            
            const config = {
                type: 'line',
                data,
                options: {
                    plugins : {
                        title: {
                            display: true,
                            text: `Confirmed Cases vs. Deaths in ${country}`,
                        },
                    },
                    elements: {
                        point:{
                            radius: 0
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                        },
                        y2 : {
                            type: 'linear',
                            display: true,
                            position: 'right',
                        }
                      },
                },

            };

            

            var myChart = new Chart(
                document.getElementById('q4-chart'),
                config
            );  

            charts.Q4.push(myChart);
        },

        OnClientError: (args) => {

            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("Q4-message");

            h5.innerHTML = "Failed To Show Chart";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "Q4-message");

        }

    }

    DestroyCharts("Q4");
    ClearElementContentsById("Q4-message");
    SendRequest(args);
    
};

document.getElementById("Q5-btn").onclick = () =>  {
    console.log("Clicked on Q5 button");
    const input = document.getElementById("q5Country").value;
    const params = `Country=${input}`;

    let args = {
        endpoint: '/Q5',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            console.log(cb_args.response_text);
            let response_arr = JSON.parse(cb_args.response_text);

            
            CreateTable(response_arr, "showTable5");
        },
        OnClientError: (args) => {

            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("Q5-message");

            h5.innerHTML = "Failed To Show Table";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "Q5-message");

        }
    }

    ClearElementContentsById("showTable5");
    ClearElementContentsById("Q5-message");
    SendRequest(args);
    
};

document.getElementById("Q6-btn").onclick = () =>  {
    console.log("Clicked on Q6 button");


    const statistic = document.getElementById("Q6-statistic").value;
    const params = `statType=${statistic}`;


    let args = {
        endpoint: '/Q6',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);
            console.log(response_arr);

            ClearElementContentsById("showTable6");
            CreateTable(response_arr, "showTable6");
        },
        OnClientError: (args) => {

            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("Q6-message");

            h5.innerHTML = "Failed To Show Table";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "Q6-message");

        }
    }

    ClearElementContentsById("showTable6");
    ClearElementContentsById("Q6-message");
    SendRequest(args);
}

document.getElementById("Q7-btn").onclick = () =>  {
    console.log("Clicked on Q7 button");
    const input = document.getElementById("q7country").value;
    const input2 = document.getElementById("q7stat").value;
    
    var params = "";
    params += `Country=${input}`,
    params += `&Stat=${input2}`;

    let args = {
        endpoint: '/Q7',
        method: 'POST',
        params: params,
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);
            //console.log("Hello");
            console.log(response_arr);
            let peak = [];
            peak.push(response_arr[response_arr.length-1]);

            ClearElementContentsById("showTable7");
            CreateTable(peak, "showTable7");

            let country = response_arr[0].Country;
            let observation_dates = [];
            let statistic = [];

            for (let i = 0; i < response_arr.length-1; ++i) {
                observation_dates.push(response_arr[i]['ObservationDate']);
                statistic.push(response_arr[i][input2]);
            }

            let data = {
                labels: observation_dates,
                datasets: [
                    {
                    label: input2,
                    yAxisID: 'y1',
                    backgroundColor: 'rgb(235, 235, 52)',
                    borderColor: 'rgb(235, 235, 52)',
                    data: statistic,
                    lineTension: 0.4,
                    }
                ]
            };   

            
            const config = {
                type: 'line',
                data,
                options: {
                    plugins : {
                        title: {
                            display: true,
                            text: `${input2} in ${country}`,
                        },
                    },
                    elements: {
                        point:{
                            radius: 0
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                        }
                      },
                },

            };

           
            var myChart = new Chart(
                document.getElementById('q7-chart'),
                config
            );

            charts.Q7.push(myChart);
        },
        OnClientError: (args) => {

            let server_response = JSON.parse(args.response_text);
            const h5 = document.createElement("h5");
            const msg_container = document.getElementById("Q7-message");

            h5.innerHTML = "Failed To Show Chart";
            msg_container.appendChild(h5);

            CreateErrorMessage(server_response, "Q7-message");

        },
    }
    

    DestroyCharts("Q7");
    ClearElementContentsById("Q7-message");
    ClearElementContentsById("showTable7");
    SendRequest(args);
}


document.getElementById("Q8-btn").onclick = () =>  {
    console.log("Clicked on Q8 button");


    let args = {
        endpoint: '/Q8',
        method: 'POST',
        params: '',
        callback: (cb_args) => {
            let response_arr = JSON.parse(cb_args.response_text);
            console.log(response_arr);
            ClearElementContentsById("showTable8");
            CreateTable(response_arr, "showTable8");
        },
    }

    SendRequest(args);
}
