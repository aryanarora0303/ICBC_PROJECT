//Import the modules
require('jquery');
require('bootstrap');
const electron = require('electron');
const { ipcRenderer } = electron;

//Data
const num_ques = 50;
let ques_current_index;
let ques_data;
let ques_num;
let selected_option;
let correct_ans;
let incorrect_ans;
let remaining_ans;
let num_skips;
let num_skips_2;
let last_skipped_ques_id = null;
let results_tracker = [];

//Signal Script Loaded
console.log("Script Loaded");

//Window On load Listener
window.onload = () => {

    //Signal Window Loaded
    console.log("Window Loaded");

    //Signal for Ready to receive the questions data
    ipcRenderer.send('ques_data:ready', true, num_ques);

    //Skip Button
    const skip_ques_button = document.querySelector(".btn-skip");
    skip_ques_button.addEventListener('click', () => {

        //Append Skipped Ques
        add_skip_ques();

        //Increment the Ques Index
        set_question_index();

        //Reset the selected option
        selected_option = null;

        //Update Skip Button View
        update_skip_btn();

        //Render ques again
        display_ques();
    })

    // Next Button
    const next_ques_button = document.querySelector(".btn-next");
    next_ques_button.disabled = true;
    next_ques_button.style.cursor = 'no-drop';
    next_ques_button.addEventListener('click', () => {

        //Disable the button
        next_ques_button.style.cursor = 'no-drop';

        //Check Answer
        check_answers();

        //Check pass/fail criteria
        check_result_criteria();

        //Update Test Progress
        show_progress();

        //Increment the Ques Index
        set_question_index();

        //Reset the selected option
        selected_option = null;

        //Update Skip Button View
        update_skip_btn();

        //Increment ques number
        ques_num++;

        //Render ques again
        display_ques();
    })

    //Ques Confirm Button
    const confirm_ques_button = document.querySelector(".btn-confirm");
    confirm_ques_button.addEventListener('click', () => {

        //Confirm Answers
        confirm_answer();

        //Update Confrim container
        update_confirm_container();
    })

    //Ques Confirm Cancel Button
    const confirm_ques_cancel_button = document.querySelector(".btn-confirm-cancel");
    confirm_ques_cancel_button.addEventListener('click', () => {

        //Render ques again
        display_ques();
    })

    //Attach Option Listeners
    attach_button_listeners();
}

//Set the question index to display
let set_question_index = () => {

    //No remaining questions
    if (ques_current_index === ques_data.length - 1) {

        //Send the result tracker to the Server
        ipcRenderer.send('test_results:ready', null, results_tracker);
    }
    else {
        ques_current_index = ques_current_index + 1;
    }

    //Track Question Array End prior to any skips
    if (ques_current_index === num_ques) {

        //Get Last Ques Skipped
        last_skipped_ques_id = ques_data[num_ques + num_skips - 1].id;
        num_skips_2 = num_skips;

        console.log("POPULATING last_skipped_ques_id", last_skipped_ques_id, ques_data[num_ques + num_skips - 1].ques)
    }

    //Reset Last Skipped For Second iteration of skips
    if ((last_skipped_ques_id != null) && (ques_current_index == (num_ques + num_skips_2 - 1)) && (ques_data[ques_current_index + 1].id)) {

        last_skipped_ques_id = ques_data[ques_current_index + 1].id;
    }
}

//Append Skipped Ques
let add_skip_ques = () => {

    //Get the Question Data
    let skipped_ques = ques_data[ques_current_index];

    //Append the Question to the ques data array
    ques_data.push(skipped_ques);

    //Increment Num Skips
    num_skips++;
}

//Update Skip Button view
let update_skip_btn = () => {

    if ((last_skipped_ques_id != null) && (last_skipped_ques_id == ques_data[ques_current_index].id)) {

        //Disable the Skip Button
        let skit_btn_el = document.querySelector('.btn-skip');
        skit_btn_el.disabled = true;
        skit_btn_el.style.cursor = 'no-drop';
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

    //Add the ques to the element
    ques_element.innerHTML = ques_data[ques_current_index].ques;

    //Add the ques number to the element
    ques_num_element.innerHTML = `Question ${ques_num} of ${num_ques}`;

    //Get Confrim Container Element
    let confirm_container_el = document.querySelector(".confirm-btn-container");

    //Get Confrim Container Buttons and display to user
    const confirm_ques_button = document.querySelector(".btn-confirm");
    const confirm_ques_cancel_button = document.querySelector(".btn-confirm-cancel");

    confirm_ques_button.style.display = "inline-block";
    confirm_ques_cancel_button.style.display = "inline-block";

    //Add Image to the Ques
    if (ques_data[ques_current_index].img) {

        ques_image_element.src = ques_data[ques_current_index].img;
        ques_image_element.classList.add('apply-image');
    }
    else {
        ques_image_element.src = "";
        ques_image_element.classList.remove('apply-image');
    }

    //Get Buttons List
    let button_list = document.querySelectorAll(".btn-options");

    //Itterate all the buttons from the buttons list
    button_list.forEach((button, index) => {

        //Make the button inactive
        button.classList.add('btn-light');
        button.classList.remove('btn-primary');

        //Remove Confirm Answer Styles
        button.classList.remove('btn-success');
        button.classList.remove('btn-danger');
        button.disabled = false;

        //Set ques options as buttons text
        button.innerHTML = ques_data[ques_current_index].options[index];
    })

    //Hide the Confirmation Container
    confirm_container_el.classList.remove("show");
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

//Check pass/fail criteria
let check_result_criteria = () => {

    //Check Pass/Fail Criteria 
    //20% ques+ incorrect => fail
    //80% ques+ correct => pass
    if (incorrect_ans >= parseInt(num_ques * 0.20)) {
        console.log("FAILED")
        ipcRenderer.send('test_results:ready', false, results_tracker);
    }
    if (correct_ans >= parseInt(num_ques * 0.80)) {
        console.log("PASSED")
        ipcRenderer.send('test_results:ready', true, results_tracker);
    }
}

//Update Confirm container
let update_confirm_container = () => {

    //Ref to buttons
    const next_ques_button = document.querySelector(".btn-next");
    const confirm_ques_button = document.querySelector(".btn-confirm");
    const confirm_ques_cancel_button = document.querySelector(".btn-confirm-cancel");

    next_ques_button.disabled = false;
    next_ques_button.style.cursor = 'pointer';
    confirm_ques_button.style.display = "none";
    confirm_ques_cancel_button.style.display = "none";
}

//Confirm Answer
let confirm_answer = () => {

    //Get Buttons List
    let button_list = document.querySelectorAll(".btn-options");

    //Update Confirm Message
    let confrim_msg = document.querySelector(".confirm-message-subheading")

    //Get Selected Button
    let selected_button;
    let correct_button;

    //Iterate the Button List
    button_list.forEach((button, index) => {

        //Disable all Buttons
        button.disabled = true;
        button.style.opacity = 1;

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
        confrim_msg.innerHTML = "Your Answer is Correct"
    }
    else {

        selected_button.classList.add("btn-danger");
        correct_button.classList.add("btn-success");
        confrim_msg.innerHTML = "Your Answer is Incorrect"
    }
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

    //Get Confrim Container Element
    let confirm_container_el = document.querySelector(".confirm-btn-container");

    //Get Confirm Message Element
    let confirm_msg_head_el = document.querySelector(".confirm-message-heading");
    let confirm_msg_subhead_el = document.querySelector(".confirm-message-subheading");

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

            //Get selected option
            let option_index = ques_data[ques_current_index].options.indexOf(selected_option);
            let option_letter;
            if (option_index == 0) {
                option_letter = "A"
            }
            else if (option_index == 1) {
                option_letter = "B"
            }
            else if (option_index == 2) {
                option_letter = "C"
            }
            else if (option_index == 3) {
                option_letter = "D"
            }

            //Assign Confirm Message
            confirm_msg_head_el.innerHTML = `You Selected answer ${option_letter}`;
            confirm_msg_subhead_el.innerHTML = `Is this you final answer?`;

            //Display the pop up
            confirm_container_el.classList.add("show");
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
    ques_num = 1;
    correct_ans = 0;
    incorrect_ans = 0;
    num_skips = 0;
    remaining_ans = ques_data_array.length;

    //Render Progress
    show_progress();

    //Render Ques
    display_ques();
})