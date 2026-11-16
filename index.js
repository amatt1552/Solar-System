import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { OBJLoader } from "jsm/loaders/OBJLoader.js";
import getSun from "./src/getSun.js";
import getNebula from "./src/getNebula.js";
import getStarfield from "./src/getStarfield.js";
import { getClickable } from "./src/setClickables.js";
import getAsteroidBelt from "./src/getAsteroidBelt.js";
import getElipticLines from "./src/getElipticLines.js";
import getPlanet from "./src/getPlanet.js"
import getChild from "./src/getChild.js"

import * as data from "./src/dataManagement.js"
import { galaxyStates} from "./src/globalVars.js"
import { initSideBar, addSelection, setSelections, setCurrentSelection, currentSelection} from "./src/sidebar.js"
import { initSimpleWindow, hideSimpleWindow, showSimpleWindow } from "./src/simpleAddWindow.js";
import { showConfirmation, setConfirmListener } from "./src/confirmationWindow.js";
import { initDataEntry, showDataEntry, hideDataEntry} from "./src/dataEntryWindow.js";
import { initDataDisplay, showData, hideData } from "./src/dataDisplayWindow.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 2.5, 4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

//const wireMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true});
//scene.overrideMaterial = wireMat;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
const useAnimatedCamera = false;
const solarSystemGroup = new THREE.Group();

async function initScene(data) {
  const { objs } = data;
  //initialize UI
  initDataEntry();
  initSimpleWindow();
  initSideBar();
  initDataDisplay();

  //initialize galaxy
  createGalaxy();

  const cameraDistance = 5;
  function animate(t = 0) {
    const time = t * 0.0002;
    requestAnimationFrame(animate);
    solarSystemGroup.userData.update(time);
    // smooth camera Tracking on target planet
    if (targetPlanet){
      setCameraTarget();
    }
    else{
      
      if (useAnimatedCamera) {
        camera.position.x = Math.cos(time * 0.75) * cameraDistance;
        camera.position.y = Math.cos(time * 0.75);
        camera.position.z = Math.sin(time * 0.75) * cameraDistance;
        camera.lookAt(0, 0, 0);
      } else {
        //controls.target.copy(new THREE.Vector3(0,0,0));
        controls.update();
      }
    }
    renderer.render(scene, camera);
  }

  animate();
}

const sceneData = {
  objs: [],
};
const manager = new THREE.LoadingManager();
manager.onLoad = () => initScene(sceneData);
const loader = new OBJLoader(manager);
const objs = ['Rock1', 'Rock2', 'Rock3'];
objs.forEach((name) => {
  let path = `./rocks/${name}.obj`;
  loader.load(path, (obj) => {
    obj.traverse((child) => {
      if (child.isMesh) {
        sceneData.objs.push(child);
      }
    });
  });
});


async function createGalaxy(){
  //galaxy has to be created in this order: galaxy, solarsystem, planets, planet's children.
  const galaxies = [new data.Galaxy("Milky Way", 0, {x:0,y:0,z:0}, null)];

  const solarSystems = [new data.SolarSystem(galaxies[0], "Sol System", {x:0,y:0,z:0}, null, null)];
  galaxies[0].solarSystems = solarSystems;

  const sunData = new data.Sun(solarSystems[0], "Sol", 1, 5778);
  const planets = [new data.Planet(
    solarSystems[0], 
    new data.Stats({name: "Earth", dangerLevel:0}),
    0.225,
    2,
    null,
    "./textures/earth.png",
    null,
    null
  )];
  solarSystems[0].sun = sunData;
  solarSystems[0].planets = planets;
  
  const moons = [new data.Moon(
    planets[0], 
    new data.Stats({name: "Moon", dangerLevel:2}),
    0.1,
    0.5, 
    null, 
    "./textures/moon.png"
  )];
  planets[0].moons = moons;
  
  setSidebarGalaxy();
  const newJson = data.createJson(galaxies);
  

  //adds update to userData.
  solarSystemGroup.userData.update = (t) => {
    solarSystemGroup.children.forEach((child) => {
      child.userData.update?.(t);
    });
  };
  scene.add(solarSystemGroup);

  const sun = getSun();
  solarSystemGroup.add(sun);

  //const filepath = "./sample-galaxies/sample-galaxy-a.json"
  //const galaxyData = await getJson(filepath);
  //const planetsData = galaxyData.galaxy.solar_systems[0].planets;
  const galaxyData = JSON.parse(newJson);
  const planetsData = galaxyData[0].solar_systems[0].planets;
  // Creates planets based on data from json
  planetsData.forEach((planetData) => {
    let moons = [];
    let ring = null;
    // Creates the moons first if any found
    planetData.moons.forEach((moonData) => {    
      const moon = getChild({ 
        stats: moonData.stats,
        size: moonData.size, 
        distance: moonData.distance, 
        img: moonData.texture, 
      });
      moons.push(moon);
      
    });

    // Creates planet rings next if any found
    //console.log(planetData.ring, planetData.name);
    if(planetData.ring){
      // This creates the most basic ring.
      const dimensions = planetData.ring.dimensions;
      const ringGeo = new THREE.TorusGeometry(
        dimensions.radius, 
        dimensions.tube, 
        dimensions.radial_segments, 
        dimensions.tubular_segments);
      const ringMat = new THREE.MeshStandardMaterial();
      const newRing = new THREE.Mesh(ringGeo, ringMat);
      newRing.scale.z =  planetData.ring.scale_z;
      // Add model here later.
      ring = newRing;
    }

    // Creates the planet
    const planet = getPlanet({
      stats: planetData.stats,
      children: moons, 
      ring: ring, 
      size: planetData.size, 
      distance: planetData.distance, 
      img: planetData.texture
    });
    solarSystemGroup.add(planet);
  });
  

  const asteroidBelt = getAsteroidBelt(objs);
  solarSystemGroup.add(asteroidBelt);

  const elipticLines = getElipticLines();
  //solarSystemGroup.add(elipticLines);

  const starfield = getStarfield({ numStars: 500, size: 0.35 });
  scene.add(starfield);

  const dirLight = new THREE.DirectionalLight(0x0099ff, 1);
  dirLight.position.set(0, 1, 0);
  scene.add(dirLight);

  const nebula = getNebula({
    hue: 0.6,
    numSprites: 10,
    opacity: 0.2,
    radius: 40,
    size: 80,
    z: -50.5,
  });
  scene.add(nebula);

  const anotherNebula = getNebula({
    hue: 0.0,
    numSprites: 10,
    opacity: 0.2,
    radius: 40,
    size: 80,
    z: 50.5,
  });
  scene.add(anotherNebula);
}

async function getJson(filepath){
  try {
    const response = await fetch(filepath);
    
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      return data; // Parses the JSON string into a JS object
  } catch (error) {
    console.error("Unable to load JSON file:", error);
  }
}

//-------------------- Sidebar Start -----------------------

// Setting selections to sidebar and back button functionality
const sidebarBack = document.getElementById("action-bar-back");
const sidebarHeader = document.getElementById("sidebar-header");
const addButton = document.getElementById("action-bar-add");
const removeButton = document.getElementById("action-bar-remove");
const simpleAddInput = document.getElementById("simple-add-input"); 
const simpleConfirm = document.getElementById("simple-confirm");
const simpleCancel = document.getElementById("simple-cancel");

// Used to remove listeners to action bar and simple add buttons.
// action bar
let addController;
let backController;
let removeController;

// simple window
let simpleConfirmController;
let simpleCancelController;

//-------------------- Sidebar Galaxies -----------------------

/**
 * Sets values for sidebar selections to galaxies
*/
function setSidebarGalaxy(){
  // Have to reset the listeners at the start. Shouldn't run on initial creation.
  // Resets add listener on action bar
  addController?.abort();
  addController = new AbortController();

  // Resets remove listener on action bar
  removeController?.abort();
  removeController = new AbortController();
  
  // Resets listeners for confirm on the simple add menu.
  simpleConfirmController?.abort();
  simpleConfirmController = new AbortController();

  // Resets listeners for cancel on simple add menu.
  simpleCancelController?.abort();
  simpleCancelController = new AbortController();
  
  // Sets header for sidebar
  sidebarHeader.innerText = "Galaxies"
  // Get map from dataManagement
  const galaxies = Array.from(data.galaxiesMap.values());
  galaxyStates.currentSolarSystem = null;
  
  const galaxyButtons = setSelections(galaxies);
  // Creates double click event for each planet button added
  galaxyButtons.forEach((button) =>{
    button.addEventListener("click", () => {
      if(currentSelection && currentSelection.id === button.id){
        // Makes the double click easier
        setSidebarSolarSystems(button.id);
      } else {
        // Single click actions
        setCurrentSelection(button.id);
      }

    });
  });
  
  // Sets listener for add button on action bar.
  addButton.addEventListener("click", () => showSimpleWindow("Create Galaxy"), {signal: addController.signal});
  
  // Sets listener for remove button on action bar.
  removeButton.addEventListener("click", () => {
    if(currentSelection){
      showConfirmation(
        data.fullTraversal(
          data.galaxiesMap.get(currentSelection.id)
        )
      );
      // The idea is to have listeners in a separate script so index Doesn't need to know as much.
      setConfirmListener(() =>{
        data.deleteGalaxy(currentSelection.id);
        setSidebarGalaxy();
      });
    }
  }, {signal: removeController.signal});

  // Sets listener for pressing enter on simple menu input.
  simpleAddInput.addEventListener("keypress", (event) => {
    if(event.key === "Enter"){
      addSidebarGalaxy(simpleAddInput.value);
      hideSimpleWindow();
    }
  }, {signal: simpleConfirmController.signal});
  // Sets listener for pressing confirm on simple menu.
  simpleConfirm.addEventListener("click", () => {
    addSidebarGalaxy(simpleAddInput.value);
    hideSimpleWindow();
  }, {signal: simpleConfirmController.signal});
  
  // Sets listener for pressing cancel on simple menu.
  simpleCancel.addEventListener("click", hideSimpleWindow);

  // Setting back button behavior
  sidebarBack.disabled = true;
}
/**
 * Adds galaxy to sidebar on pressing add.
 */
function addSidebarGalaxy(name = "Unknown"){
  const galaxy = new data.Galaxy(name, 0, {x:0,y:0,z:0}, []);
  const newButton = addSelection(galaxy);
  
  newButton.addEventListener("click", () => {
    if(currentSelection && currentSelection.id === newButton.id){
      setSidebarSolarSystems(newButton.id)
    } else {
      setCurrentSelection(newButton.id);
    }
  });
}

//-------------------- Sidebar SolarSystems -----------------------

/**
 * Sets values for sidebar selections to solarsystems found in selected galaxy.
 */
function setSidebarSolarSystems(galaxyID){
  // Have to remove listener on add button first so it doesnt add to previous section.
  addController?.abort();
  addController = new AbortController();

  // Removes listener on back button.
  backController?.abort();
  backController = new AbortController();

  // Resets remove listener on action bar
  removeController?.abort();
  removeController = new AbortController();

  // Resets listeners for confirm on the simple add menu.
  simpleConfirmController?.abort();
  simpleConfirmController = new AbortController();

  // Resets listeners for cancel on simple add menu.
  simpleCancelController?.abort();
  simpleCancelController = new AbortController();

  // Sets header for sidebar
  sidebarHeader.innerText = "Solar Systems"
  // Use galaxy's map to get array of solarsystems
  const galaxy = data.galaxiesMap.get(galaxyID);
  galaxyStates.currentGalaxy = galaxy;
  galaxyStates.currentSolarSystem = null;

  const solarSystems = galaxy.solarSystems;
  const solarSystemButtons = setSelections(solarSystems);
  
  // Creates double click event for each planet button added
  if(solarSystemButtons){
    solarSystemButtons.forEach((button) =>{
      button.addEventListener("click", () => {
        if(currentSelection && currentSelection.id === button.id){
          setSidebarPlanets(button.id);
        } else {
          setCurrentSelection(button.id);
        }
      });
    });
  }

  // Sets listener for add button on action bar.
  addButton.addEventListener("click", () => showSimpleWindow("Create Solar System"), {signal: addController.signal});
  
  // Sets listener for remove button on action bar.
  removeButton.addEventListener("click", () => {
    if(currentSelection){
      showConfirmation(
        data.fullTraversal(
          data.solarSystemsMap.get(currentSelection.id)
        )
      );
      // The idea is to have listeners in a separate script so index Doesn't need to know as much.
      setConfirmListener(() =>{
        data.deleteSolarSystem(currentSelection.id);
        setSidebarSolarSystems(galaxyID);
      });
    }
  }, {signal: removeController.signal});

  // Sets listener for pressing enter on simple menu input.
  simpleAddInput.addEventListener("keypress", (event) => {
    if(event.key === "Enter"){
      addSidebarSolarSystem(galaxyID, simpleAddInput.value);
      hideSimpleWindow();
    }
  }, {signal: simpleConfirmController.signal});
  // Sets listener for pressing confirm on simple menu.
  simpleConfirm.addEventListener("click", () => {
    addSidebarSolarSystem(galaxyID, simpleAddInput.value);
    hideSimpleWindow();
  }, {signal: simpleConfirmController.signal});
  
  // Sets listener for pressing cancel on simple menu.
  simpleCancel.addEventListener("click", hideSimpleWindow);
  
  // Setting back button behavior
  sidebarBack.disabled = false;
  sidebarBack.addEventListener("click", () => {
    setSidebarGalaxy();
  }, {signal:backController.signal});
}
/**
 * Adds solar system to sidebar on pressing add.
 */
function addSidebarSolarSystem(galaxyID, name){
  const galaxy = data.galaxiesMap.get(galaxyID);
  const solarSystem = new data.SolarSystem(galaxy, name, 0, {x:0,y:0,z:0}, null, null);
  const newButton = addSelection(solarSystem);
  
  newButton.addEventListener("click", () => {
    if(currentSelection && currentSelection.id === newButton.id){
      setSidebarPlanets(newButton.id);
    } else {
      setCurrentSelection(newButton.id);
    }
  });
}


//-------------------- Sidebar Planets -----------------------

/**
 * Sets values for sidebar selections to solarsystems found in selected galaxy.
 */
function setSidebarPlanets(solarSystemID){
  // Have to remove listener on add button first so it doesnt add to previous section.
  addController?.abort();
  addController = new AbortController();
  
  // Resets remove listener on action bar.
  removeController?.abort();
  removeController = new AbortController();

  //then removes listener on back button.
  backController?.abort();
  backController = new AbortController();

  // Resets listeners for confirm on the simple add menu.
  simpleConfirmController?.abort();
  simpleConfirmController = new AbortController();

  // Resets listeners for cancel on simple add menu.
  simpleCancelController?.abort();
  simpleCancelController = new AbortController();

  // Sets header for sidebar
  sidebarHeader.innerText = "Planets"
  // Use solarsystem's map to get array of planets
  const solarSystem = data.solarSystemsMap.get(solarSystemID);
  galaxyStates.currentSolarSystem = solarSystem;
  galaxyStates.currentPlanet = null;
  
  const planets = solarSystem.planets;
  const planetButtons = setSelections(planets);
  // Creates double click event for each planet button added
  if(planetButtons){
    planetButtons.forEach((button) =>{
      button.addEventListener("click", () => {
        if(currentSelection && currentSelection.id === button.id){
          setSidebarMoons(button.id);
          hideDataEntry();
        } else {
          setCurrentSelection(button.id);
          showDataEntry(button.id)
        }
      });
    });
  }

  // Sets listener for add button on action bar.
  addButton.addEventListener("click", () => showSimpleWindow("Create Planet"), {signal: addController.signal});
  
  // Sets listener for remove button on action bar.
  removeButton.addEventListener("click", () => {
    if(currentSelection){
      showConfirmation(
        data.fullTraversal(
          data.planetsMap.get(currentSelection.id)
        )
      );
      // The idea is to have listeners in a separate script so index Doesn't need to know as much.
      setConfirmListener(() =>{
        data.deletePlanet(currentSelection.id);
        setSidebarPlanets(solarSystemID);
        hideDataEntry();
      });
    }
  }, {signal: removeController.signal});

  
  // Sets listener for pressing enter on simple menu input.
  simpleAddInput.addEventListener("keypress", (event) => {
    if(event.key === "Enter"){
      addSidebarPlanet(solarSystemID, simpleAddInput.value);
      hideSimpleWindow();
    }
  }, {signal: simpleConfirmController.signal});
  // Sets listener for pressing confirm on simple menu.
  simpleConfirm.addEventListener("click", () => {
    addSidebarPlanet(solarSystemID, simpleAddInput.value);
    hideSimpleWindow();
  }, {signal: simpleConfirmController.signal});
  
  // Sets listener for pressing cancel on simple menu.
  simpleCancel.addEventListener("click", hideSimpleWindow);
  
  // Setting back button behavior
  sidebarBack.disabled = false;
  sidebarBack.addEventListener("click", () =>{
    setSidebarSolarSystems(solarSystem.galaxy.id);
    hideDataEntry();
  },{signal:backController.signal});
}

/**
 * Adds Planet to sidebar on pressing add.
 */
function addSidebarPlanet(solarSystemID, name){
  const solarSystem = data.solarSystemsMap.get(solarSystemID);
  const planet = new data.Planet(solarSystem, new data.Stats({name: name}), 1, 1, null, null);
  const newButton = addSelection(planet);
  
  newButton.addEventListener("click", () => {
    if(currentSelection && currentSelection.id === newButton.id){
      setSidebarMoons(newButton.id);
      hideDataEntry();
    } else {
      setCurrentSelection(newButton.id);
      showDataEntry(newButton.id);
    }
    
  });
}

//-------------------- Sidebar Moons -----------------------

/**
 * Sets values for sidebar selections to solarsystems found in selected galaxy.
 */
function setSidebarMoons(planetID){
  // Have to remove listener on add button first so it doesnt add to previous section.
  addController?.abort();
  addController = new AbortController();

  // Resets listener on back button.
  backController?.abort();
  backController = new AbortController();

  // Resets remove listener on action bar.
  removeController?.abort();
  removeController = new AbortController();

  // Resets listeners for confirm on the simple add menu.
  simpleConfirmController?.abort();
  simpleConfirmController = new AbortController();

  // Resets listeners for cancel on simple add menu.
  simpleCancelController?.abort();
  simpleCancelController = new AbortController();
  
  // Sets header for sidebar
  sidebarHeader.innerText = "Moons"
  // Use planet's map to get array of moons
  const planet = data.planetsMap.get(planetID);
  galaxyStates.currentPlanet = planet;

  const moons = planet.moons;
  const moonButtons = setSelections(moons);
  
  // Moons have no double click options.
  if(moonButtons){
    moonButtons.forEach((button) =>{
      button.addEventListener("click", () => {
        showDataEntry(button.id);
        setCurrentSelection(button.id);
      });
    });

  }
  
  // Sets listener for add button on action bar.
  addButton.addEventListener("click", () => showSimpleWindow("Create Moon"), {signal: addController.signal});
  
  // Sets listener for remove button on action bar.
  removeButton.addEventListener("click", () => {
    if(currentSelection){
      showConfirmation(
        data.fullTraversal(
          data.moonsMap.get(currentSelection.id)
        )
      );
      // The idea is to have listeners in a separate script so index Doesn't need to know as much.
      setConfirmListener(() =>{
        data.deleteMoon(currentSelection.id);
        setSidebarMoons(planetID);
        hideDataEntry();
      });
    }
  }, {signal: removeController.signal});

  // Sets listener for pressing enter on simple menu input.
  simpleAddInput.addEventListener("keypress", (event) => {
    if(event.key === "Enter"){
      addSidebarMoon(planetID, simpleAddInput.value);
      hideSimpleWindow();
    }
  }, {signal: simpleConfirmController.signal});
  
  // Sets listener for pressing confirm on simple menu.
  simpleConfirm.addEventListener("click", () => {
    addSidebarMoon(planetID, simpleAddInput.value);
    hideSimpleWindow();
  }, {signal: simpleConfirmController.signal});
  
  // Sets listener for pressing cancel on simple menu.
  simpleCancel.addEventListener("click", hideSimpleWindow);
  
  // Setting back button behavior
  sidebarBack.disabled = false;
  sidebarBack.addEventListener("click", () =>{
    setSidebarPlanets(planet.solarSystem.id);
    hideDataEntry();
  }, {signal: backController.signal});
}

/**
 * Adds Moon to sidebar on pressing add.
 */
function addSidebarMoon(planetID, name){
  const planet = data.planetsMap.get(planetID);
  const moon = new data.Moon(planet, new data.Stats({name: name}), 1, 1, null, null);
  const newButton = addSelection(moon);
  
  newButton.addEventListener("click", () => {
    showDataEntry(newButton.id);
    setCurrentSelection(newButton.id);
  });
}

//-------------------- Sidebar End -----------------------


// Should be called to update information on successful click.
function updatePlanetUI(name, description, avgTemp, hospitable){
  document.getElementsByClassName('planet-name')[0].textContent = name;
  document.getElementsByClassName('planet-description')[0].textContent = description;
  //document.getElementsByClassName('avg-temp')[0].textContent = avgTemp;
  //document.getElementsByClassName('hospitable')[0].textContent =  hospitable;
}
function showPlanetUI(){
  showData();
  controls.enabled = false;
}

function hidePlanetUI(){
  hideData();
  controls.enabled = true;
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);



let targetPlanet = null;
function setCameraTarget(){
  const planetWorldPos = new THREE.Vector3();
    targetPlanet.getWorldPosition(planetWorldPos);
    const offsetTarget = new THREE.Vector3(
      planetWorldPos.x + 0.4, 
      planetWorldPos.y, 
      planetWorldPos.z
    );

    // Define where the camera should hover relative to the planet
    const idealCameraPos = new THREE.Vector3(
      planetWorldPos.x + 0,
      planetWorldPos.y + 0.0, 
      planetWorldPos.z + 1
    );

     // Check the distance between camera and its destination
    const distance = camera.position.distanceTo(idealCameraPos);
    
    if (distance > 0.01) {
      // Smoothly interpolate (lerp) camera and control target towards the planet
      // 0.05 controls the speed (lower = smoother/slower, higher = snappier)
      camera.position.lerp(idealCameraPos, 0.05);
      controls.target.lerp(offsetTarget, 0.05);
    } else {
       // Lock it directly to the planet's position to stop the drifting lag
      camera.position.copy(idealCameraPos);
      controls.target.copy(offsetTarget);
    }
    controls.update();
    //console.log("target acquired")

}

// Allows you to click objects in scene.
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const rect = renderer.domElement.getBoundingClientRect();
window.addEventListener('click', (event) => {
  // Gets mouse position based on window
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Shoots ray using camera
  raycaster.setFromCamera(mouse, camera);
  const activeClickables = getClickable();
  activeClickables.forEach(mesh => mesh.updateMatrixWorld(true));
  console.log("Objects clickable", activeClickables);
  
  // Determines what the ray intersects
  const intersects = raycaster.intersectObjects(scene.children, true);


  if(intersects.length > 0){
    // The closest clicked Object will always be 0
    let clickedObj = intersects[0].object;

    // climb up the tree until we find the parent that IS in your array!
    while (clickedObj && !activeClickables.includes(clickedObj) && clickedObj.parent) {
        clickedObj = clickedObj.parent;
        //console.log(clickedObj);
    }

    // Now that we have the actual registered planet mesh:
    const planetInfo = clickedObj.userData.stats;
    if (clickedObj && planetInfo) {
      
      targetPlanet = clickedObj;
      updatePlanetUI(
        planetInfo.name, 
        planetInfo.description, 
        5, 
        50);
      showPlanetUI();
    } else {
      targetPlanet = null;
      hidePlanetUI();
    }
  }
  else{
    targetPlanet = null;
    hidePlanetUI();
  }
});