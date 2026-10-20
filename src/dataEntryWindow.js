import {translateHide, translateShow, Direction} from "./transitions.js";

const dataEntryOuter = document.getElementById("data-entry-outer");
const atmosphereStatList = document.getElementById("data-entry-atmosphere-list");
const addDataAtmosphereStat = document.getElementById("data-entry-add-atmosphere-stat");

const cityList = document.getElementById("data-entry-city-list");
const addDataCity = document.getElementById("data-entry-add-city");

let initDone;
const transitionTime = 0.5;

export function initDataEntry(){
    dataEntryOuter.style.visibility = 'hidden';
    // Initializes input that you can add more inputs to
    atmosphereStatList.replaceChildren();
    cityList.replaceChildren();

    initDone = false;
    translateHide(dataEntryOuter, 0.1, Direction.RIGHT, 100);
}

export function showDataEntry(){
    translateShow(dataEntryOuter, transitionTime);
}

export function hideDataEntry(){
    translateHide(dataEntryOuter, transitionTime, Direction.RIGHT);
}

// Runs after transition is complete 
dataEntryOuter.addEventListener("transitionend", (event) => {
  if(!initDone){
    dataEntryOuter.style.visibility = 'visible';
    initDone = true;
  }
});

//runs when plus button for atmosphere stats is pressed
addDataAtmosphereStat.addEventListener("click", () => addInput(atmosphereStatList));

addDataCity.addEventListener("click", () => addInput(cityList, true))
function addInput(parent, useTextArea = false){
    const inputType = useTextArea ? "textarea" : "input";
    // Set new container
    const container = document.createElement("span");
    container.classList.add("added-input", "input-container-full-width", "remove-spacing-t");
    // Create input
    const input = document.createElement(inputType);
    input.classList.add("flex-input");
    // Create minus button
    const minusButton = document.createElement("button");
    minusButton.classList.add("minus-button")
    // Setup event for minus button
    minusButton.addEventListener("click", () =>{
        minusButton.parentNode.remove();
    });
    // Create span for minus button to create line
    const minusButtonSpan = document.createElement("span");
    // Putting it all together
    minusButton.appendChild(minusButtonSpan);
    container.appendChild(input);
    container.appendChild(minusButton);
    parent.appendChild(container);
}


export default initDataEntry;