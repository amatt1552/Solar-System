import {translateHide, translateShow, Direction} from "./transitions.js";
import {Stats, Planet, Ring, Moon, galaxiesMap, solarSystemsMap, planetsMap, moonsMap } from "./dataManagement.js";
import {galaxyStates} from "./globalVars.js"
import {updateSideBar} from "./sidebar.js";

const dataEntryOuter = document.getElementById("data-entry-outer");
const dataEntryHeader = document.getElementById("data-entry-header");

// All data entry fields 
// Values that determine how the planet is created.
const modelInput = document.getElementById("data-entry-model");
const textureInput = document.getElementById("data-entry-texture");
const sizeInput = document.getElementById("data-entry-size");
const distanceInput = document.getElementById("data-entry-distance");

// Ring values that determine how the ring is created.
const useRingInput = document.getElementById("data-entry-use-ring");
const ringScaleOuterInput = document.getElementById("data-entry-ring-scale-outer");
const ringScaleInput = document.getElementById("data-entry-ring-scale");
const ringTypeOuterInput = document.getElementById("data-entry-ring-type-outer");
const ringTypeInput = document.getElementById("data-entry-ring-type");
// Custom ring values
const ringCustomOuter = document.getElementById("data-entry-ring-custom-outer");
const ringRadiusInput = document.getElementById("data-entry-ring-radius");
const ringTubeInput = document.getElementById("data-entry-ring-tube");
const ringRadialSegmentsInput = document.getElementById("data-entry-ring-radial-segments");
const ringTublarSegmentsInput = document.getElementById("data-entry-ring-tubular-segments");
// Model ring values
const ringModelOuter = document.getElementById("data-entry-ring-model-outer");
const ringModelInput = document.getElementById("data-entry-ring-model");
const ringTextureInput = document.getElementById("data-entry-ring-texture");
// Asteroid ring values
const ringAsteroidsOuter = document.getElementById("data-entry-ring-asteroids-outer");
const ringAsteroidModelsInput = document.getElementById("data-entry-asteroid-full-model");
const ringAddAsteroidButton = document.getElementById("data-entry-add-asteroid");
const ringAsteroidSizeMinInput = document.getElementById("data-entry-asteroid-size-min");
const ringAsteroidSizeMaxInput = document.getElementById("data-entry-asteroid-size-max");
const ringAsteroidDistanceMinInput = document.getElementById("data-entry-asteroid-distance-min");
const ringAsteroidDistanceMaxInput = document.getElementById("data-entry-asteroid-distance-max");

// Values that give information about the planet
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

// Values for saving, reverting, and defaulting the data entry window.
const saveEntriesButton = document.getElementById("save-entry");

let initDone;
let currentSelectionID;
let oldSelectionID;
let isPlanet = true;
let currentPlanetoid = null;
const transitionTime = 0.5;

export function initDataEntry(){
    dataEntryOuter.style.visibility = 'hidden';
    // Initializes input that you can add more inputs to

    atmosphereStatList.replaceChildren();
    cityList.replaceChildren();

    checkUseRing();

    initDone = false;
    translateHide(dataEntryOuter, 0.1, Direction.RIGHT, 100);
}
/**
 * Used to first set the inputs in data entry window then show the data entry window.
 * Should be set from clicking a planet or moon in the sidebar.
 */
export function showDataEntry(selectionID){
    if(!selectionID){
        console.error("No selection ID provided to showDataEntry");
        return;
    }
    currentSelectionID = selectionID;
    
    // Decides if the current selection is a planet or moon.
    isPlanet = planetsMap.has(currentSelectionID);
    // Tries to get the planet or moon with the current selection ID
    currentPlanetoid = isPlanet ? planetsMap.get(currentSelectionID) : moonsMap.get(currentSelectionID);
    // if currentPlanetoid is null then the selection ID is invalid.
    if(!currentPlanetoid){
        console.error("Invalid selection ID provided to showDataEntry: " + currentSelectionID);
        return;
    }

    //Change header to match the type of planetoid being edited.
    dataEntryHeader.textContent = isPlanet ? "Planet Data" : "Moon Data";
    //console.log("Showing data entry for selection ID: " + currentSelectionID);
    if(oldSelectionID !== currentSelectionID) {
        oldSelectionID = currentSelectionID;
        clearAddedInputs();
        planetoidToEntries(currentPlanetoid);
    }
    translateShow(dataEntryOuter, transitionTime);

}

export function hideDataEntry(){
    translateHide(dataEntryOuter, transitionTime, Direction.RIGHT);
}


/**
 * Determines if the current selection is a planet or moon and fills the data entry fields with the values from that object.
 * @returns void
 */
export function planetoidToEntries(planetoid){
    if(!planetoid){
        console.error("No planetoid provided to planetoidToEntries");
        return;
    }

    if(planetoid.model === null){
        modelInput.value = '';
    } else {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(planetoid.modelFile);
        modelInput.files = dataTransfer.files;
    }
    console.log("planetoidTexture: ", planetoid.texture);
    if(planetoid.texture === null){
        textureInput.value = '';
    } else {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(planetoid.textureFile);
        textureInput.files = dataTransfer.files;
    }
    sizeInput.value = planetoid.size;
    distanceInput.value = planetoid.distance;

    // Everything for rings.
    useRingInput.checked = false;
    if(isPlanet && planetoid.ring){
        // Global values for ring
        useRingInput.checked = true;
        ringScaleInput.value = planetoid.ring.scale;
        ringTypeInput.selectedIndex = planetoid.ring.type;
        
        // Custom ring values
        ringRadiusInput.value = planetoid.ring.radius;
        ringTubeInput.value = planetoid.ring.tube;
        ringRadialSegmentsInput.value = planetoid.ring.radialSegments;
        ringTublarSegmentsInput.value = planetoid.ring.tubularSegments;
        
        // Model ring values
        if(planetoid.ring.model === null){
            ringModelInput.value = '';
        } else {
            ringModelInput.files = planetoid.ring.model;
        }
        if(planetoid.ring.texture === null){
            ringTextureInput.value = '';
        } else {
            ringTextureInput.files = planetoid.ring.texture;
        }

        // Asteroid ring values
        const labels = ["Model:", "Texture:"];
        planetoid.ring.asteroidFullModels.forEach((fullModel) => {
            const asteroidFullModels = [fullModel.model, fullModel.texture];
            addInputs(ringAsteroidModelsInput, asteroidFullModels, labels, false, true);
        });
        ringAsteroidSizeMinInput.value = planetoid.ring.asteroidSizeMin;
        ringAsteroidSizeMaxInput.value = planetoid.ring.asteroidSizeMax;
        ringAsteroidDistanceMinInput.value = planetoid.ring.asteroidDistanceMin;
        ringAsteroidDistanceMaxInput.value = planetoid.ring.asteroidDistanceMax;
    }
    // Everything for planet stats
    nameInput.value = planetoid.stats.name;
    descriptionInput.value = planetoid.stats.description;
    biomesInput.value = planetoid.stats.biomes;
    temperatureInput.value = planetoid.stats.averageTemp;
    gravityInput.value = planetoid.stats.gravity;
    dayLengthInput.value = planetoid.stats.dayLength;
    compositionInput.value = planetoid.stats.composition;

    atmosphereDangerInput.selectedIndex = planetoid.stats.dangerLevel;
    planetoid.stats.atmosphereStats.forEach((stat) => {
        addInputs(atmosphereStatList, [stat], [""]);

    });
    
    
    humanoidSummaryInput.value = planetoid.stats.humanoidSummary;
    planetoid.stats.cities.forEach((city) => {
        addInputs(cityList, [city], [""]);
    });

}

/**
 * Converts the current values in the data entry fields into a planet or moon object and modifies the current selection with those values.
 * @returns planet or moon
 */
export function entriesToPlanetoid(){
    
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

    // Everything for rings.
    const useRing = useRingInput.checked;
    const ringScale = ringScaleInput.value;
    const ringType = ringTypeInput.selectedIndex;
    // Custom ring values
    const ringRadius = ringRadiusInput.value;
    const ringTube = ringTubeInput.value;
    const ringRadialSegments = ringRadialSegmentsInput.value;
    const ringTubularSegments = ringTublarSegmentsInput.value;
    // Model ring values
    let ringModel = null;
    if (ringModelInput.files.length > 0) {
        ringModel = ringModelInput.files[0];
    }
    let ringTexture = null;
    if (ringTextureInput.files.length > 0){
        ringTexture = ringTextureInput.files[0];
    }
    // Asteroid ring values
    const asteroidFullModels = [];
    const asteroidModelsinputArray = Array.from(ringAsteroidModelsInput.children);
    for (let i = 0; i < asteroidModelsinputArray.length; i += 4){
        let model = null;
        const modelFile = asteroidModelsinputArray[i + 1];
        if((modelFile && modelFile.files && modelFile.files.length > 0)){
           model = modelFile.files[0];
        }
        let texture = null;
        const textureFile = asteroidModelsinputArray[i + 3];
        if((textureFile && textureFile.files && textureFile.files.length > 0)){
            texture = textureFile.files[0];
        }
        asteroidFullModels.push({ model: model, texture: texture });
        
    }
    const asteroidSizeMin = ringAsteroidSizeMinInput.value;
    const asteroidSizeMax = ringAsteroidSizeMaxInput.value;
    const asteroidDistanceMin = ringAsteroidDistanceMinInput.value;
    const asteroidDistanceMax = ringAsteroidDistanceMaxInput.value;

    // Everything for planet stats
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

    // Rings dont auto add to a map so can be created instead of modified.
    // Moons current dont have rings so this is only for planets.
    if(isPlanet){
        const newRing = new Ring({
            planet: currentPlanetoid,
            type: ringType,
            scale: ringScale,
            asteroidFullModels: asteroidFullModels,
            asteroidSizeRange: {min: asteroidSizeMin, max: asteroidSizeMax},
            asteroidDistanceRange: {min: asteroidDistanceMin, max: asteroidDistanceMax},
            fullModel: {model: ringModel, texture: ringTexture},
            dimensions: {radius: ringRadius, tube: ringTube, radial_segments: ringRadialSegments, tubular_segments: ringTubularSegments}
        })
    }
    // Stats dont auto add to a map so can be created instead of modified.
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

    
    currentPlanetoid.stats = inputStats;
    if(isPlanet) currentPlanetoid.ring = newRing;
    currentPlanetoid.size = size;
    currentPlanetoid.distance = distance;
    currentPlanetoid.model = modelFile;
    currentPlanetoid.texture = textureFile;

    updateSideBar();
    return currentPlanetoid;
}


// Runs after transition is complete 
dataEntryOuter.addEventListener("transitionend", (event) => {
  if(!initDone){
    dataEntryOuter.style.visibility = 'visible';
    initDone = true;
  }
});

// Runs when plus button for atmosphere stats is pressed
addDataAtmosphereStat.addEventListener("click", () => addInput(atmosphereStatList));

// Runs when plus button for cities is pressed
addDataCity.addEventListener("click", () => addInput(cityList, true))

// Runs when plus button for asteroid models is pressed
ringAddAsteroidButton.addEventListener("click", () => {

    addInputs(ringAsteroidModelsInput, [null, null], ["Model:", "Texture:"], false, true);
});

/**
 * Adds a single input to the parent element. If useTextArea is true then a textarea will be added instead of an input.
 */
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
/**
 * Adds multiple inputs to one line.
 */
function addInputs(parent, values, labels, useTextArea = false, useFile = false){
    // Container is outside to keep all in one container.
    const inputType = useTextArea ? "textarea" : "input";
    const container = document.createElement("span");
    container.classList.add("added-input", "input-container-full-width", "remove-spacing-t");
    
    if(values.length !== labels.length){
        console.error("Values and labels must be the same length");
        return;
    }

    for (let i = 0; i < values.length; i++){
        let label = null;
        if(labels[i] !== ""){
            label = document.createElement("span");
            label.textContent = labels[i];
        }
        const input = document.createElement(inputType);
        if(useFile){
            input.type = "file";
            if(values[i] === null){
                input.value = '';
            }else{
            input.files = values[i];
            }
        }else{
            input.value = values[i];
        }
        input.classList.add("flex-input");
        if(label) container.appendChild(label);
        container.appendChild(input);
    }

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
    container.appendChild(minusButton);
    parent.appendChild(container);

}

/**
 * Clears inputs from atmosphere stats and cities
 */
function clearAddedInputs(){
    cityList.replaceChildren();
    atmosphereStatList.replaceChildren();
}

// Events for handling ring values visibility.
useRingInput.addEventListener("change", () => {
    checkUseRing();
});
ringTypeInput.addEventListener("change", () => {
    checkRingType();
});

function checkUseRing(){
    const isChecked = useRingInput.checked;
    ringScaleOuterInput.style.display = isChecked ? "flex" : "none";
    ringTypeOuterInput.style.display = isChecked ? "flex" : "none";
    if(isChecked){
        checkRingType();
    }else{
        ringCustomOuter.style.display = "none";
        ringModelOuter.style.display = "none";
        ringAsteroidsOuter.style.display = "none";
    }
    
}

function checkRingType(){
    const ringType = ringTypeInput.selectedIndex;
    ringCustomOuter.style.display = ringType === 0 ? "block" : "none";
    ringModelOuter.style.display = ringType === 1 ? "block" : "none";
    ringAsteroidsOuter.style.display = ringType === 2 ? "block" : "none";
}

saveEntriesButton.addEventListener("click", () =>{
    console.log(entriesToPlanetoid());
});

export default initDataEntry;