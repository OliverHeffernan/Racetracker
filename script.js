var times = [];
var startTime;
var time = 0;
var started = false;
var finished = false;
var amountFinishers = 0;
var system = "metric";
var distance = 6;
var venue;
var raceName;
var surface;
var unit;

// Setting variables for parts of the website to be accessed later
const SetUpPage = document.getElementById("setUp");
const EntryPage = document.getElementById("participantFormContainer");
const EditPage = document.getElementById("editParticipantFormContainer");
const App = document.getElementById("app");
const DControls = document.getElementById("controls");

var binIndex = 0;


// Arrays storing the details about participants
var fNames = [];
var lNames = [];
var ages = [];
var schools = [];
var numbers = [];
var genders = [];
var bibNumbers = [];

// Runs when the start race button is clicked
function start() {
    startTime = Date.now();
    started = true;
    //hiding the "Start Race" button and showing the "Stop Race" button, in a loop so that it gets mobile controls aswell
    for (var i = 0; i < 2; i++) {
        document.getElementsByClassName("beginCont")[i].style.display = "none";
        document.getElementsByClassName("endCont")[i].style.display = "inline-block";
    }
    updateTime();
}

//Update the time in every frame
while (started) {
    updateTime()
}

//checks if all registered racers have finished before the race is ended
function checkEnd() {
    if (fNames.length - amountFinishers > 0) {
        // displays a warning message if there are some registered participants who have not finished
        document.getElementById("endWarningMessage").className = "show-warning";
    } else {
        // ends the race if all registered participants have finished
        end();
    }
}

//hides the end warning message
function hideBox(box) {
    document.getElementById(box).className = "hidden";
}

// runs when the "end race" button is clicked if the warning message is not shown
function end() {
    started = false;
    finished = true;

    //hiding the end button and showing the export button
    for (var i = 0; i < 2; i++) {
        document.getElementsByClassName("endCont")[i].style.display = "none";
        document.getElementsByClassName("exportCont")[i].style.display = "block";
    }

    //hide the last row of the result table, because it is not a result, it just shows the current time
    var rows = document.getElementsByClassName("resultRow");
    rows[rows.length - 1].style.display = "none";
    hideBox("endWarningMessage");
}

// runs when the "Record Runner Time" button is clicked
function addTime() {
    // getting a variable for the results table body
    var body = document.getElementById("rBody");
    var timesDisp = document.getElementsByClassName("timeRes");

    // if the timer has been stopped, then this will set the current time to a second after the last result, and add it to the table
    if (finished) {
        // makes sure that the previous time is 0 or positive
        if (times[times.length - 2] < 0) {
            previousTime = 0;    
        }

        var previousTime = times[times.length - 2] == null ? 0 : times[times.length - 2];

        // setting the current time to the previous time plus another second
        time = previousTime + 1;

        // getting an array of the rows in the results table
        var rows = Array.from( document.getElementsByClassName("resultRow") );

        // getting a variable of the outerHTML of the placeholder row before removing it
        var hiddenRow = rows[rows.length - 1].outerHTML;
        rows[rows.length - 1].remove();

        // ading the new row and adding information like time difference, pace and time
        body.innerHTML += newRow(amountFinishers + 1);
        timesDisp[timesDisp.length - 1].innerHTML = secToMinSec(time);
        document.getElementsByClassName("paceRes")[timesDisp.length - 1].innerHTML = calcPace(time);
        document.getElementsByClassName("timeDiffRes")[timesDisp.length - 1].innerHTML = "+" + secToMinSec(time - times[0]);

        // adding the placeholder row back to the end of the table
        body.innerHTML += hiddenRow;
    }

    // if the race is either finished or still in progress
    if (finished || started) {
        //if there is a placeholder, we need to remove it before adding the time to the array
        if (timesDisp.length > 1) {
            times.splice(timesDisp.length - 1, 1);
        }

        //add the time to the times array and add a place holder, this helps if a time is being edited and moved the end of the array
        times.push(time);
        times.push(times[times.length - 1] * 1000);
        var index = finished ? timesDisp.length - 2 : timesDisp.length - 1;

        //updating the amount of finishers
        amountFinishers++;

        //displaying the amount of people still running
        document.getElementById("runnersRunning").innerText = fNames.length - amountFinishers;

        //adding an edit button to the time
        var lastTime = timesDisp[index].innerHTML;
        timesDisp[index].innerHTML =  '<i onclick="editTime(this)" id="' + binIndex + '" class="fa-solid fa-pen-to-square edit"></i>' + lastTime;
       
        //adding a delete button to the placing cell
        var element = document.getElementsByClassName("placing")[index];
        element.innerHTML = '<i class="fa-solid fa-trash-can bin" id="' + binIndex + '" onclick="deleteRow(this)"></i>' + element.innerHTML;
        binIndex++;
    }

    // if the race is in progress, then we need to add a new row, leaving the pre-existing row with all of the correct values
    if (started && !finished) {
        body.innerHTML += newRow(amountFinishers + 1);
    }


    // refilling the values of the number input fields, and leaving them blank if undefined.
    var inputs = document.getElementsByName("number");
    for (var i = 0; i < inputs.length-1; i++) {
        // setting the value of the input to the correct bib number
        inputs[i].value = numbers[i];

        // if the value is undefined then it should be blank
        if (inputs[i].value == "undefined") {
            inputs[i].value = "";
        }

        // if the name is undefined then it should be blank
        var names = document.getElementsByClassName("nameRes");
        if (names[i].innerHTML == "undefined" || names[i].innerHTML == "undefined undefined") {
            names[i].innerHTML = "";
        }
    }

    // making sure that the first time difference is blank
    document.getElementsByClassName("timeDiffRes")[0].innerHTML = "";
}

//global variable which will be accessed in saveEditTime() function
var timeEditIndex;
function editTime(ele) {
    //getting an array of the edit buttons
    var elements = Array.from( document.getElementsByClassName("edit") );

    //using the array to find the index of the time being edited
    timeEditIndex = elements.indexOf(ele);

    // an array of the time being edited e.g. [seconds, minutes, hours]
    var timeArray = secToMinSec(times[timeEditIndex]).split(":").reverse();

    // an array of the input fields in the edit time window
    var timeDispArray = [document.getElementById("seconds"), document.getElementById("minutes"), document.getElementById("hours")];

    // setting the value of each input to 0, in case a value is not edited in the following for loop, for example
    // if a time does not involve hours, then it will need to be changed to 0.
    timeDispArray.forEach(element => {element.value = 0;});

    // looping through each of the time input fields and filling in the time being edited.
    for (var i = 0; i < timeArray.length; i++) {
        timeDispArray[i].value = timeArray[i];
    }

    //showing the edit form
    document.getElementById("editTimeFormContainer").style.display = "block";


    // checking if the name will be undefined
    var text;
    if (numbers[timeEditIndex] == "") {
        // will not display a name if it is undefined
        text = "";
    } else {
        // if the name is defined then it will be displayed
        text = fNames[numbers[timeEditIndex]] + "  " + lNames[numbers[timeEditIndex]];
    }

    // display the number and the name if defined of the time being edited
    document.getElementById("placingEdited").innerHTML = timeEditIndex + 1 + ": " + text;
}

function arrayitemmove(array, fi, ti) {
    //moving the array to a local variable so that we don't mutate the array from within the function
    var arr = array;

    //saving the item being moved and removing it from the array
    var element = arr[fi];
    arr.splice(fi, 1);

    var newArray = [];

    //checking if the item is being moved to a higher index, because when we remove the item from the array the desired movetoindex changes
    if (fi < ti) {
        ti -= 1;
    }

    //checking if index is the "toindex" then adding the moved item, every repeat we add an item from the original array, the moved item will be added into the desired position in the array
    for (var i = 0; i < arr.length; i++) {
        if (i == ti) {
            newArray.push(element);
        }
        newArray.push(arr[i]);
    }

    return newArray;
}

function deleteRow(ele) {
    //getting the index of the row being removed
    var elements = document.getElementsByClassName("bin");
    var elementsId = [];
    for (var i = 0; i < elements.length; i++) {
        elementsId.push(elements[i].id);
    }
    var index = elementsId.indexOf(ele.id);

    //removing the row from the table and removing data from other arrays, also updating the amount of finishers variable
    times.splice(index, 1);
    numbers.splice(index, 1);
    amountFinishers -= 1;
    document.getElementsByClassName("resultRow")[index].remove();
   
    //updating timeDifference and placing cells
    resetPlacingNumbers();

    //checking if there is only one item left in the times array as this will be a place holder
    if (times.length == 1) {
        //removing the place holder
        times.splice(0, 1);
    }
}

//called in deleteRow function and saveEditTimeFunction
function resetPlacingNumbers() {
    var placingNumbers = document.getElementsByClassName("placingNumber");

    //goes through placing number elements and sets the innerHTML so that the placings are correct
    //sets timeDifference for all cells except the first one as there is no difference
    for (var i = 0; i < placingNumbers.length; i++) {
        placingNumbers[i].innerHTML = i + 1;
        if (i != 0) {
            document.getElementsByClassName("timeDiffRes")[i].innerHTML = "+" + secToMinSec( times[i] - times[0] );
        }
    }
    //making sure the first row has no time difference
    document.getElementsByClassName("timeDiffRes")[0].innerHTML = "";
}

function saveEditTime() {
    //getting variables from edit time form
    var seconds = parseFloat(document.getElementById("seconds").value);
    var minutes = parseFloat(document.getElementById("minutes").value);
    var hours = parseFloat(document.getElementById("hours").value);

    //check if any of the inputs are negative
    var negative = false;
    if (seconds < 0 || minutes < 0 || hours < 0) {
        negative = true;
        console.log(negative);
    }

    //combining previous variables into one variable in seconds unit
    var minToSec = minutes * 60;
    var hourToSec = hours * 3600;
    var tempTime = seconds + minToSec + hourToSec;

    //if the time is not running we need to ensure that the placeholder is still greater than the time
    if (!started) {
        if (times[times.length - 1] < tempTime) {
            times[times.length - 1] = tempTime * 1000;
        }
    }

    //checking if the time is in the future
    //if the timer is not running then it should not matter that the time is in the future, we want full editing capabilities to keep the design flexible
    if ((tempTime < time || started == false) && !negative) {
        //adding the time to the times array, and adding it to the results table
        times[timeEditIndex] = tempTime;
        binIndex++;
        document.getElementsByClassName("timeRes")[timeEditIndex].innerHTML = '<i onclick="editTime(this)" class="fa-solid fa-pen-to-square edit" id="' + binIndex + '"></i>' + secToMinSec(times[timeEditIndex]);
        document.getElementsByClassName("paceRes")[timeEditIndex].innerHTML = calcPace(times[timeEditIndex]);

        //hiding the editTimeForm
        document.getElementById("editTimeFormContainer").style.display = "none";

        //removing the error message
        document.getElementById("editError").innerHTML = "";

        //update Time diff
        for (var i = 0; i < times.length - 1; i++) {
            document.getElementsByClassName("timeDiffRes")[i].innerHTML = i == 0 ? "" : "+" + secToMinSec( times[i] - times[0] );
        }
    } else {
        var error = document.getElementById("editError");
        if (!negative) {
            //if the time is in the future and the timer is still running, we send an error message and end the function
            error.innerHTML = "This time is in the future";
        } else {
            error.innerHTML = "One or more of the inputs are negative"
        }
        return;
    }

    //reorders the table if the time is in the wrong place after being changed
    //get array of result rows
    var rows = Array.from(document.getElementsByClassName("resultRow"));
    var newIndex;
    var move = false;

    //finding the first index where the new time is less than the time currently in that index
    for (var i = 0; i < times.length; i++) {
        if (times[timeEditIndex] < times[i]) {
            newIndex = i;
            move = true;

            //exiting the loop
            i = times.length + 5;
        }
    }

    // if we need to move a time, then it will be moved
    if (move) {
        //using the new index found previously to move items
        rows = arrayitemmove(rows, timeEditIndex, newIndex);
        times = arrayitemmove(times, timeEditIndex, newIndex);
        numbers = arrayitemmove(numbers, timeEditIndex, newIndex);

        //comibining all the rows into one string
        var rowsCombined = "";
        for (var i = 0; i < rows.length; i++) {
            rows[i] = rows[i].outerHTML;
            rowsCombined += rows[i];
        }

        //removing all rows from table
        document.querySelectorAll(".resultRow").forEach(row => {row.remove()});

        //adding the rows back to the table in the correct order, and getting the placings in the correct order
        document.getElementById("rBody").innerHTML += rowsCombined;
        resetPlacingNumbers();
       
        //putting the numbers back into the inputs
        var inputs = document.getElementsByName("number");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].value = numbers[i];
        }
    }
}

function closeEditForm() {
    document.getElementById("editTimeFormContainer").style.display = "none";
    document.getElementById("editError").innerHTML = "";
}

function newRow(p) {
    //used to add a row to the results table
    return '<tr class="resultRow"><td class="placing"><em class="placingNumber">' + p + '</em></td><td class="nameRes"></td><td class="schoolRes"></td><td class="raceNoRes"><input id="number" type="text" name="number"></td><td class="genderRes"></td><td class="ageRes"></td><td class="timeRes"></td><td class="paceRes"></td><td class="timeDiffRes"></td></tr>';
}

function newYetToFinishRow(name, rep, bibNo, index, gender, age) {
    //adds a row to the table in the side panel when a participant is registered
    return "<tr class='participantRow clickable' ondblclick='editParticipant(" + index + ")'><td class='yetToFinishNumber' onclick='editParticipant(" + index + ")'><i class='fa-solid fa-pen-to-square'></i>" + bibNo + "</td><td class='yftName'>" + name + "</td><td>" + rep + "</td><td>" + gender + "</td><td>" + age + "</td></tr>";
}

var editRaceNo;
function editParticipant(raceNo) {
    //opening the editparticipant window and moving data into the input fields
    const words = document.getElementById("editNumber").innerHTML.split(":")[0];
    document.getElementById("editNumber").innerHTML = words + ": " + bibNumbers[raceNo];
    document.getElementById("editFirstName").value = fNames[raceNo];
    document.getElementById("editLastName").value = lNames[raceNo];
    document.getElementById("editAge").value = ages[raceNo];
    document.getElementById("editGenderSelect").value = genders[raceNo];
    document.getElementById("editSchool").value = schools[raceNo];
    EditPage.style.display = "block";

    //global variable to be accessed when saving an edit
    editRaceNo = raceNo;
}

function saveParticipantDetails() {
    //getting race number from previous function
    var raceNo = editRaceNo;

    //moving information from form to arrays
    fNames[raceNo] = document.getElementById("editFirstName").value;
    lNames[raceNo] = document.getElementById("editLastName").value;
    ages[raceNo] = document.getElementById("editAge").value;
    genders[raceNo] = document.getElementById("editGenderSelect").value;
    schools[raceNo] = document.getElementById("editSchool").value;
    var bibNo = bibNumbers[raceNo];

    //updating the table in the side panel with the new information, and hiding the edit window
    document.getElementsByClassName("participantRow")[raceNo].innerHTML = editYetToFinishRow(fNames[raceNo].charAt() + " " + lNames[raceNo], schools[raceNo], raceNo, bibNo, genders[raceNo], ages[raceNo]);
    EditPage.style.display = "none";
}

function editYetToFinishRow(name, rep, index, bibNo, gender, age) {
    return "<td class='yetToFinishNumber' onclick='editParticipant(" + index + ")'><i class='fa-solid fa-pen-to-square'></i>" + bibNo + "</td><td class='yftName'>" + name + "</td><td>" + rep + "</td><td>" + gender + "</td><td>" + age + "</td>";
}

// fills names and other details into the table based on the race number, this function is referenced at the end of the updateTime() function.
function updateTable() {
    //gets a variable for table rows
    rows = document.getElementsByClassName("resultRow");

    //clearing the numbers array so that values can be pushed into it
    numbers = [];

    //goes through the rows and updates all information that depends on the race number
    var count = rows.length;
    for (var i = 0; i < count; i++) {
        //gets the race number from the input field and adds it to the numbers array
        var bibNo = rows[i].querySelector("#number").value;
        var index = bibNumbers.indexOf(bibNo);
        numbers.push(rows[i].querySelector("#number").value);

        //checks if the row has a race number
        if (bibNumbers.includes(bibNo)) {
            //adds information to the row based on the race number
            rows[i].querySelector(".nameRes").innerHTML = fNames[index] + " " + lNames[index];
            rows[i].querySelector(".schoolRes").innerHTML = schools[index];
            rows[i].querySelector(".genderRes").innerHTML = genders[index];
            rows[i].querySelector(".ageRes").innerHTML = ages[index];
        } else {
            //there is no race number so the row should be blank
            rows[i].querySelector(".nameRes").innerHTML = "";
            rows[i].querySelector(".schoolRes").innerHTML = "";
            rows[i].querySelector(".ageRes").innerHTML = "";
            rows[i].querySelector(".genderRes").innerHTML = "";
        }
        //makes sure the name is not undefined
        var name = document.getElementsByClassName("nameRes")[i];
        if (name.innerHTML == "undefined") {
            name.innerHTML = "";
        }
    }
    document.getElementsByClassName("timeDiffRes")[0].innerHTML = "";
}

//calculates the pace in minutes per kilometer
function calcPace(pTime) {
    //gets the pace in seconds per kilometer
    var paceSecKm = pTime/distance;

    //gets the amount fo minutes and remaining seconds
    var paceMin = Math.floor(paceSecKm/60);
    var paceSec = Math.floor(paceSecKm - paceMin*60);

    //adding 0 padding to the seconds variable
    paceSec = paceSec.toString().length == 1 ? "0" + paceSec : paceSec;

    //returns the result in min'sec" format
    return paceMin + "'" + paceSec + '"';
}

//runs every second, updating the time, pace, and time difference
function updateTime() {
    //checks if the timer is running
    if (started) {
        //gets the difference between the current time and the start time, then converts it to seconds
        time = (Date.now() - startTime) / 1000;

        //displays the time in both mobile and desktop modes
        for (var i = 0; i < 2; i++) {
            //display time
            document.getElementsByClassName('timeCont')[i].innerHTML = secToMinSec(time);
        }

        //displaying the time in the final row of the results table
        var timesResults = document.getElementsByClassName('timeRes');
        timesResults[timesResults.length - 1].innerHTML = secToMinSec(time);

        //displaying pace in the next row of table
        var pace = calcPace(time);
        var paceResults = document.getElementsByClassName('paceRes');
        paceResults[paceResults.length - 1].innerHTML = pace;

        //checking if anyone has finished
        if (amountFinishers > 0) {
            //calculating and displaying time difference
            var timeDiffSec = time - times[0];
            var timeDiffResults = document.getElementsByClassName("timeDiffRes");
            timeDiffResults[timeDiffResults.length - 1].innerHTML = "+" + secToMinSec(timeDiffSec);
        }
    }
    updateTable();
    //sets time out for update time to run again
    setTimeout(updateTime, 1.1);
}

//converts from seconds to hours:minutes:seconds, minutes:seconds or just seconds
function secToMinSec(sec) {
    //gets amount of hours, remaining minutes and remaining seconds
    var hours = Math.floor(sec/3600);
    var minutes = Math.floor(sec/60 - hours * 60);
    var seconds = (sec - minutes*60 - hours*3600).toFixed(2);

    //adds zero padding to seconds and minutes
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    //returns the time in the necessary format
    return hours == 0 ? minutes == 0 ? seconds : minutes + ":" + seconds : hours + ':' + minutes + ':' + seconds;
}

//sets variables like distance and venue after the form is complete
function submitDetails() {
    //displays error message if required fields are empty
    var errorMessage = document.getElementById("setUpErrorMessage");
    if (document.getElementById("distanceInput").value == "" || document.getElementById("distanceInput").value <= 0 || !parseFloat(document.getElementById("distanceInput").value)) {
        errorMessage.innerHTML = "Please enter a valid distance";
    } else if (document.getElementById("raceNameInput").value == "" || document.getElementById("raceNameInput").value == "undefined") {
        errorMessage.innerHTML = "Please enter a race name";
    } else if (document.getElementById("venueInput").value == "" || document.getElementById("venueInput").value == "undefined") {
        errorMessage.innerHTML = "Please enter a venue";
    } else {
        //if no errors, then details are submitted
        //if unit is meters, then distance is converted to kilometers for easier pace calculations, if unit is miles it is not changed and pace will be measured in minutes per mile
        var converter = document.getElementById("unitSelect").value;
        distance = document.getElementById("distanceInput").value;
        var multiplier = converter != "mi" ? parseFloat(converter) : 1;
        distance *= multiplier;

        //setting the unit
        unit = converter == "mi" ? "mi" : converter == "0.001" ? "m" : "km";

        //set whether the results should use impeiral or metric measurements
        if (converter == "mi") {
            system = "imperial";

            //changes the pace to min/mi in the results table
            document.getElementById("pace").innerHTML = "Min/mi";
        } else {
            system = "metric";
        }

        //set the venue of the race
        venue = document.getElementById("venueInput").value;

        //set the surface type
        surface = document.getElementById("surfaceSelect").value;

        //set and display the race name
        raceName = document.getElementById("raceNameInput").value;
        document.getElementById("raceName").innerHTML = raceName;

        //display race information
        var info = venue + " - " + surface + " - " + distance / multiplier + unit;
        document.getElementById("raceInfo").innerHTML = info;

        //hide the setup form and show the app screen and racer entry form
        SetUpPage.style.display = "none";
        EntryPage.style.display = "block";
        App.style.display = "block";
        DControls.className = "controls-shown";

        //show the runner details button
        document.getElementById("rDetailsButtonHidden").id = "rDetailsButtonShown";
    }
}

function racerEntryClose () {
    racerEntry();
    closeEntryForm();
}

//enters a racer into the race
function racerEntry(close) {
    //checks that all required fields are filled, and that the racer has their number
    var errorMessage = document.getElementById("entryErrorMessage");
    var bibNo = document.getElementById("bibNumber").value;
    if (document.getElementById("firstName").value == "" || document.getElementById("lastName").value == "" || document.getElementById("age").value == "" || document.getElementById("age").value == "0") {
        errorMessage.innerHTML = "Please fill in all required* fields";
    } else {
        //if no entry errors
        //checks if the racer has already been registered, their details will be updated based on the most recent entry, but their number will remain the same
        var alreadyRegistered = false;
        for (var i = 0; i < fNames.length; i++) {
            //check if the name is already registered
            if (document.getElementById("firstName").value == fNames[i] && document.getElementById("lastName").value == lNames[i]) {
                //alerts the user and updates their details, but keeps their number the same
                alert("This racer has already been registered, your race number will be " + bibNumbers[i]);
                alreadyRegistered = true;
                ages[i] = document.getElementById("age").value;
                genders[i] = document.getElementById("genderSelect").value;
                schools[i] = document.getElementById("school").value;

                //edit the table row in the side panel
                document.getElementsByClassName("participantRow")[i].innerHTML = editYetToFinishRow(fNames[i].charAt() + " " + lNames[i], schools[i], i, bibNo, genders[i], ages[i]);
            }
        }
        
        //check if the bib number is already taken
        if (bibNumbers.includes(bibNo)) {
            errorMessage.innerHTML = 'This bib number is already taken, press the "Random Number" button for a number that is not taken.';
        } else {  
            //if not already registered and their bib number is not taken already then they are registered normally
            if (!alreadyRegistered) {
                //update the people still running element
                document.getElementById("runnersRunning").innerText = fNames.length - amountFinishers + 1;

                //adds the new runner's details to the arrays
                fNames.push(document.getElementById("firstName").value);
                lNames.push(document.getElementById("lastName").value);
                ages.push(document.getElementById("age").value);
                genders.push(document.getElementById("genderSelect").value);
                schools.push(document.getElementById("school").value);
                bibNumbers.push(document.getElementById("bibNumber").value);

                //empties the form so that the next registration can be made 
                var inputs = Array.from(document.getElementsByClassName("partInput"));
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].value = "";
                }

                //adds the new registration to the table in the side panel
                var runnerindex = fNames.length - 1;
                document.getElementById("yetToFinishBody").innerHTML += newYetToFinishRow(fNames[runnerindex].charAt() + " " + lNames[runnerindex], schools[runnerindex], bibNo, runnerindex, genders[runnerindex], ages[runnerindex]);

                //checks if the window should be closed
                if (close) {
                    closeEntryForm();
                }
            }
        }
    }
}

function closeEntryForm() {
    EntryPage.style.display = "none";
    EditPage.style.display = "none";

    var inputs = Array.from( document.getElementsByClassName("partInput") );
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }
}

function openEntryForm() {
    EntryPage.style.display = "block";
}

//variable used to check if the side panel is opened or closed
var hmbrgropen = false;

//opens or closes the side panel
function hamburger() {
    //gets variables for the side bar and main panel
    var aside = document.getElementById("sideBar");
    var section = document.getElementById("main");

    //checks if the sidepanel is already open
    if (hmbrgropen) {
        //if it is open then it will be closed
        hmbrgropen = false;

        //rotates the button that opens and closes the side panel
        document.getElementById("asideArrow").style.transform = "rotate(0deg)";

        //closes the side panel
        aside.className = "asideClosed";
        section.className = "sectionAsideClosed";
    } else {
        //if it is closed then it will be opened
        hmbrgropen = true;

        //rotates the button that opens and closes the side panel
        document.getElementById("asideArrow").style.transform = "rotate(180deg)";

        //opens the side panel
        aside.className = "asideOpen";
        section.className = "sectionAsideOpen";
    }
}

function exportResults() {
    //duplicate table
    var exportTable = document.getElementById("exportTable");
    exportTable.innerHTML += document.getElementById("raceInfoDisp").outerHTML;
    exportTable.innerHTML += document.getElementById("tableHead").outerHTML;

    //getting variables for time difference and pace
    var timeDiffs = document.getElementsByClassName("timeDiffRes");
    var paces = document.getElementsByClassName("paceRes");

    //creating a temp time variable so that the placeholder can be removed without removing it globally
    var tempTimes = times;
    tempTimes.splice(tempTimes.length - 1, 1);

    //adding a row for each time to the export table
    for (var i = 0; i < tempTimes.length; i++) {
        //setting the class to even or odd to implement alternating row colors
        var rowClass = i % 2 == 0 ? "even" : "odd";

        //get index from bib number
        var index = bibNumbers.indexOf(numbers[i]);

        //adding the row to the table
        exportTable.innerHTML += "<tr class='exportResultRow" + rowClass + "'><td class='exportCell'>" + (i + 1) + "</td><td class='exportCell'>" + fNames[index] + " " + lNames[index] + "</td><td class='exportCell'>" + schools[index] + "</td><td class='exportCell'>" + numbers[i] + "</td><td class='exportCell'>" + genders[index] + "</td><td class='exportCell'>" + ages[index] + "</td><td class='exportCell'>" + secToMinSec( tempTimes[i] ) + "</td><td class='exportCell'>" + paces[i].innerHTML + "</td><td class='exportCell'>" + timeDiffs[i].innerHTML;
    }
    var cells = Array.from( document.getElementsByClassName("exportCell") );
    
    cells.forEach(cell => {
        if (cell.innerHTML == "undefined" || cell.innerHTML == "undefined undefined") {
            cell.innerHTML = "";
        }
    });

    //setting the formatting for the pdf file
    const options = {
        filename: "results",
        image: {type: "jpeg", quality: 1},
        html2canvas: {
            dpi: 250,
            scale:4,
            letterRendering: true,
            useCORS: true
        },
        jsPDF: { unit: "mm", format: "a3", orientation: "portrait", margin: "15mm"}
    };

    //export the new table to a pdf file
    html2pdf().set(options).from(exportTable).save();

    //remove the export table from the site
    exportTable.remove();
}

function randomBibNumber() {
    //get a random number with a max based on the amount of digits in the amount of runners
    var digits = fNames.length.toString().length;
    digits = digits < 3 ? 3 : digits;
    var number = Math.floor(Math.random() * Math.pow(10, digits));
    while (bibNumbers.includes(number)) {
        var number = Math.floor(Math.random() * Math.pow(10, digits));
    }
    document.getElementById("bibNumber").value = number;
}

//adds warning message when the user attempts to reload or close the page
window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
};