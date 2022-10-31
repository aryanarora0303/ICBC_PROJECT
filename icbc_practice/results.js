//Import the modules
require('jquery');
require('bootstrap');
const electron = require('electron');
const { ipcRenderer } = electron;

//Data
let ques_current_index;
let ques_data;
let results_tracker;

//Signal Script Loaded
console.log("Script Loaded");

//Window On load Listener
window.onload = () => {

    //Signal Window Loaded
    console.log("Window Loaded");

    //Signal for Ready to receive the results data
    ipcRenderer.send('results_page:ready', true);
};

//Render the Result Ques and Options to the user
let display_results = () => {

    //Iterate through the results trackers array
    for(let index = 0; index < results_tracker.length; index++){

        //Creating Ques Container
        let ques_container_el = document.createElement('div');
        let ques_num_el       = document.createElement('h1');
        let ques_el           = document.createElement('h1');

        ques_container_el.setAttribute('id', 'results-ques');

        ques_num_el.innerHTML = results_tracker[index].data.id + 1;
        ques_el.innerHTML     = results_tracker[index].data.ques;

        ques_container_el.appendChild(ques_num_el);
        ques_container_el.appendChild(ques_el);

        //Adding Styles to Ques Container
        ques_num_el.classList.add("display-4", "ques-number");
        ques_el.classList.add("display-4", "ques");
        ques_container_el.classList.add("jumbotron", "ques-container", "results-ques-container");

        //Adding Ques Container
        document.body.appendChild(ques_container_el);

        //Created Button Options Container
        let btn_container_el = document.createElement('div');
        let btn_1 = document.createElement('button');
        let btn_2 = document.createElement('button');
        let btn_3 = document.createElement('button');
        let btn_4 = document.createElement('button');

        btn_1.setAttribute("id", "btn_1");
        btn_2.setAttribute("id", "btn_2");
        btn_3.setAttribute("id", "btn_3");
        btn_4.setAttribute("id", "btn_4");

        btn_1.innerHTML = results_tracker[index].data.options[0];
        btn_2.innerHTML = results_tracker[index].data.options[1];
        btn_3.innerHTML = results_tracker[index].data.options[2];
        btn_4.innerHTML = results_tracker[index].data.options[3];

        btn_container_el.appendChild(btn_1);
        btn_container_el.appendChild(btn_2);
        btn_container_el.appendChild(btn_3);
        btn_container_el.appendChild(btn_4);

        //Adding Styles to Button Container
        btn_container_el.classList.add("jumbotron", "btn-container", "results-btn-container");
        btn_1.classList.add("btn", "btn-options", "btn-light", "results-btn");
        btn_2.classList.add("btn", "btn-options", "btn-light", "results-btn");
        btn_3.classList.add("btn", "btn-options", "btn-light", "results-btn");
        btn_4.classList.add("btn", "btn-options", "btn-light", "results-btn");

        //Highlight Correct Options
        if(btn_1.innerHTML === results_tracker[index].data.ans){
            btn_1.classList.remove("results-btn");
            btn_1.classList.add("btn-success");
        }
        if(btn_2.innerHTML === results_tracker[index].data.ans){
            btn_2.classList.remove("results-btn");
            btn_2.classList.add("btn-success");
        }
        if(btn_3.innerHTML === results_tracker[index].data.ans){
            btn_3.classList.remove("results-btn");
            btn_3.classList.add("btn-success");
        }
        if(btn_4.innerHTML === results_tracker[index].data.ans){
            btn_4.classList.remove("results-btn");
            btn_4.classList.add("btn-success");
        }

        //Highlight Incorrect Options
        if(btn_1.innerHTML === results_tracker[index].selected_option && btn_1.innerHTML !== results_tracker[index].data.ans){
            btn_1.classList.remove("results-btn");
            btn_1.classList.add("btn-danger");
        }
        if(btn_2.innerHTML === results_tracker[index].selected_option && btn_2.innerHTML !== results_tracker[index].data.ans){
            btn_2.classList.remove("results-btn");
            btn_2.classList.add("btn-danger");
        }
        if(btn_3.innerHTML === results_tracker[index].selected_option && btn_3.innerHTML !== results_tracker[index].data.ans){
            btn_3.classList.remove("results-btn");
            btn_3.classList.add("btn-danger");
        }
        if(btn_4.innerHTML === results_tracker[index].selected_option && btn_4.innerHTML !== results_tracker[index].data.ans){
            btn_4.classList.remove("results-btn");
            btn_4.classList.add("btn-danger");
        }

        //Disable Rest Buttons
        if(btn_1.classList.contains("results-btn")){
            btn_1.disabled = true;
        }
        if(btn_2.classList.contains("results-btn")){
            btn_2.disabled = true;
        }
        if(btn_3.classList.contains("results-btn")){
            btn_3.disabled = true;
        }
        if(btn_4.classList.contains("results-btn")){
            btn_4.disabled = true;
        }

        //Adding Ques Container
        document.body.appendChild(btn_container_el);

        //Create Horizontal Ruler
        let hr_el = document.createElement('hr');

        //Adding HR to Body
        document.body.appendChild(hr_el);
    }
}

//Listen for the Ques Data
ipcRenderer.on('results_data:add', (e, results_data_array, ques_data_array) => {

    console.log("RECEIVED RESULTS", results_data_array, ques_data_array)

    //Set Ques and Results Data
    ques_current_index = 0;
    result_current_index = 0;
    ques_data = ques_data_array;
    results_tracker = results_data_array;

    //Render Results
    display_results();
})