import {translateHide, translateShow, Direction} from "./transitions.js";
import {Stats, Planet, Moon} from "./dataManagement.js";
import {galaxyStates} from "./globalVars.js"

const dataEntryOuter = document.getElementById("data-entry-outer");

// All data entry fields 
const modelInput = document.getElementById("data-entry-model");
const textureInput = document.getElementById("data-entry-texture");
const sizeInput = document.getElementById("data-entry-size");
const distanceInput = document.getElementById("data-entry-distance");

const nameInput = document.getElementById("data-entry-name");
const descriptionInput = document.getElementById("data-entry-description");
const biomesInput = document.getElementById("data-entry-biomes");
const temperatureInput = document.getElementById("data-entry-temperature");
const gravityInput = document.getElementById("data-entry-gravity");
const dayLengthInput = document.getElementById("data-entry-day-length");
const compositionInput = document.getElementById("data-entry-composition");

const atmosphereDangerInput = document.getElementById("data-entry-atmosphere");
const atmosphereStatList = document.getElementById("data-entry-atmosphere-stats");
const addDataAtmosphereStat = document.getElementById("data-entry-add-atmosphere-stat");

const humanoidSummaryInput = document.getElementById("data-entry-humanoid-summary");
const cityList = document.getElementById("data-entry-city-list");
const addDataCity = document.getElementById("data-entry-add-city");

const saveEntriesButton = document.getElementById("save-entry");

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



export function planetToEntries(){

}

export function entriesToPlanet(){
    let modelFile = null
    if (modelInput.files.length > 0) {
        modelFile = modelInput.files[0];
    }
    let textureFile = null;
    if (textureInput.files.length > 0){
        textureFile = textureInput.files[0];
    }
    const size = sizeInput.value;
    const distance = distanceInput.value;

    const name = nameInput.value;
    const description = descriptionInput.value;
    const biomes = biomesInput.value;
    const temperature = temperatureInput.value;
    const gravity = gravityInput.value;
    const dayLength = dayLengthInput.value;
    const composistion = compositionInput.value;
    
    const atmosphereDanger = atmosphereDangerInput.selectedIndex;
    const atmosphereStats = [];
    Array.from(atmosphereStatList.children).forEach((child) => {
        const input = child.querySelector("input");
        if(input){
            atmosphereStats.push(input.value);
        }
    });
    
    const humanoidSummary = humanoidSummaryInput.value;
    const cities = [];
    Array.from(cityList.children).forEach((child) => {
        const input = child.querySelector("textarea");
        if(input){
            cities.push(input.value);
        }
    });

    const inputStats = new Stats({
        name: name,
        description: description,
        biomes: biomes,
        averageTemp: temperature,
        gravity: gravity,
        dayLength: dayLength,
        composistion: composistion,
        dangerLevel: atmosphereDanger,
        atmosphereStats: atmosphereStats,
        humanoidSummary: humanoidSummary,
        cities: cities
    });
    const newPlanet = new Planet(galaxyStates.currentSolarSystem, inputStats, size, distance, modelFile, textureFile, null, null);
    return newPlanet;
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

saveEntriesButton.addEventListener("click", () =>{
    console.log(entriesToPlanet());
});

export default initDataEntry;