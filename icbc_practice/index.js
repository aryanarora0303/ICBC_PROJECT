//Import the modules
require('jquery');
require('bootstrap');
const electron = require('electron');
const { ipcRenderer } = electron;

//Data
let ques_current_index;
let ques_data;
let selected_option;
let selected_option_error;
let correct_ans;
let incorrect_ans;
let remaining_ans;
let results_tracker = [];

//Signal Script Loaded
console.log("Script Loaded");

//Window On load Listener
window.onload = () => {

    //Signal Window Loaded
    console.log("Window Loaded");

    //Signal for Ready to receive the questions data
    ipcRenderer.send('ques_data:ready', true);

    //Next Button
    const next_ques_button = document.querySelector(".btn-next");
    //Disable Next Ques Button
    next_ques_button.disabled = true;

    next_ques_button.addEventListener('click', () => {

        //Disable Next Ques Button
        next_ques_button.disabled = true;

        //Reset Confirm Button Styles and Active State
        reset_button_styles();

        //Check Valid User Input
        check_input();

        //Check Error before proceding
        if(selected_option_error){
            return;
        }

        //Check Answer
        check_answers();

        //Update Test Progress
        show_progress();

        //Increment the Ques Index
        set_question_index();

        //Reset the selected option
        selected_option = null;

        //Render ques again
        display_ques();
    })

    //Confirm Button
    const confirm_ques_button = document.querySelector(".btn-confirm");
    confirm_ques_button.addEventListener('click', () => {

        //Check Valid User Input
        check_input();

        //Check Error before proceding
        if(selected_option_error){
            return;
        }

        //Disable Next Ques Button
        next_ques_button.disabled = false;

        //Confirm Answer
        confirm_answer();
    })

    //Attach Option Listeners
    attach_button_listeners();
}

//Set the question index to display
let set_question_index = () => {

    //Get the option error element
    let option_error_el = document.querySelector("#option-error");

    //If Error Exists, Do not Increment Question Index i.e. Change Ques
    if (option_error_el.innerHTML != "") {
        return;
    }

    //No remaining questions
    if (ques_current_index === ques_data.length - 1) {

        console.log("TEST OVER, SENDING SIGNAL TO SERVER")

        //Send the result tracker to the Server
        ipcRenderer.send('test_results:ready', results_tracker);
    }
    else {
        ques_current_index = ques_current_index + 1;
    }
}

//Render the Ques and Options to the user
let display_ques = () => {

    //Get Ques Element
    const ques_element = document.querySelector(".ques");

    //Get Ques Number Element
    const ques_num_element = document.querySelector(".ques-number");

    //Get Ques Image Element
    const ques_image_element = document.querySelector(".ques-image")

    //Get Ques Audio Element
    const ques_audio_element = document.querySelector(".ques-audio");

    //Add the ques to the element
    ques_element.innerHTML = ques_data[ques_current_index].ques;

    //Add the ques number to the element
    ques_num_element.innerHTML = `${ques_current_index + 1}.`;

    //Add Image to the Ques
    ques_image_element.src = (ques_data[ques_current_index].img ? ques_data[ques_current_index].img : "");

    //Add Audio to the Ques
    ques_audio_element.src = (ques_data[ques_current_index].audio ? ques_data[ques_current_index].audio : "");

    //Get Buttons List
    let button_list = document.querySelectorAll(".btn-options");

    //Itterate all the buttons from the buttons list
    button_list.forEach((button, index) => {

        //Make the button inactive
        button.classList.add('btn-light');
        button.classList.remove('btn-primary');

        //Set ques options as buttons text
        button.innerHTML = ques_data[ques_current_index].options[index];
    })
}

//Check Valid User Input
let check_input = () => {

    //Get the option error element
    let option_error_el = document.querySelector("#option-error");

    //Check if there's selected option
    if (!selected_option) {
        option_error_el.innerHTML = "Error: Please Select an option below"
        selected_option_error = true;
        return
    }
    else {
        option_error_el.innerHTML = ""
        selected_option_error = false;
    }
}

//Check user answers
let check_answers = () => {

    //Check Answer
    if (selected_option == ques_data[ques_current_index].ans) {
        correct_ans++;
        remaining_ans--;
    }
    else {
        results_tracker.push({
            data: ques_data[ques_current_index],
            selected_option: selected_option
        })
        incorrect_ans++;
        remaining_ans--;
    }
}

//Confirm Answer
let confirm_answer = () => {

    //Get Buttons List
    let button_list = document.querySelectorAll(".btn-options");

    //Get Selected Button
    let selected_button;
    let correct_button;

    //Iterate the Button List
    button_list.forEach((button, index) => {

        //Disable all Buttons
        button.disabled = true;

        //Found Selected button
        if (button.innerHTML == selected_option) {
            selected_button = button;
        }

        //Found Correct button
        if (button.innerHTML == ques_data[ques_current_index].ans) {
            correct_button = button;
        }
    })

    //Check Answer
    if (selected_button.innerHTML == correct_button.innerHTML) {

        correct_button.classList.add("btn-success");
    }
    else {

        selected_button.classList.add("btn-danger");
        correct_button.classList.add("btn-success");
    }
}

//Reset Button Styles and Active State
let reset_button_styles = () => {

    //Get Buttons List
    let button_list = document.querySelectorAll(".btn-options");

    //Iterate the Button List
    button_list.forEach((button, index) => {

        button.disabled = false;

        button.classList.remove("btn-success", "btn-danger");
    })
}

//Show test progress
let show_progress = () => {

    //Render Result Values
    let correct_ans_ele = document.querySelector('.correct-answers');
    let incorrect_ans_ele = document.querySelector('.incorrect-answers');
    let remaining_ans_ele = document.querySelector('.remaining-answers');

    //Assign Values
    correct_ans_ele.innerHTML = "Correct: " + correct_ans;
    incorrect_ans_ele.innerHTML = "Incorrect: " + incorrect_ans;
    remaining_ans_ele.innerHTML = "Remaining: " + remaining_ans;
}

//Attach Option Button Listeners
let attach_button_listeners = () => {

    //Get Buttons List
    let button_list = document.querySelectorAll(".btn-options");

    //Itterate all the buttons from the buttons list
    button_list.forEach((button, index) => {

        //Add click listener to each button 
        button.addEventListener('click', (e) => {

            //Can only select one button
            button_list.forEach((button, index) => {
                //Make the button inactive
                button.classList.add('btn-light');
                button.classList.remove('btn-primary');
            })

            //Make the button active
            button.classList.remove('btn-light');
            button.classList.add('btn-primary');

            //Get button Value
            let btn_value = button.innerHTML;

            //User Selected Option
            selected_option = btn_value;
        });
    })
}

//Listen for the Ques Data
ipcRenderer.on('ques_data:add', (e, ques_data_array) => {

    //Set Ques Data
    ques_data = ques_data_array;

    //Set Ques Index
    ques_current_index = 0;

    //Set Results initial Values
    correct_ans = 0;
    incorrect_ans = 0;
    remaining_ans = ques_data_array.length;

    //Update Test Progress
    show_progress();

    //Render Ques
    display_ques();
})