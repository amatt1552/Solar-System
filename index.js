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

// const wireMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true});
// scene.overrideMaterial = wireMat;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
const useAnimatedCamera = false;
function initScene(data) {
  const { objs } = data;
  const solarSystem = new THREE.Group();
  solarSystem.userData.update = (t) => {
    solarSystem.children.forEach((child) => {
      child.userData.update?.(t);
    });
  };
  scene.add(solarSystem);

  const sun = getSun();
  solarSystem.add(sun);

  const mercury = getPlanet({ size: 0.1, distance: 1.25, img: 'mercury.png', name: 'mercury' });
  solarSystem.add(mercury);

  const venus = getPlanet({ size: 0.2, distance: 1.65, img: 'venus.png', name: 'venus' });
  solarSystem.add(venus);

  const moon = getPlanet({ size: 0.075, distance: 0.4, img: 'moon.png' });
  const earth = getPlanet({ children: [moon], size: 0.225, distance: 2.0, img: 'earth.png', name: 'earth' });
  solarSystem.add(earth);

  const mars = getPlanet({ size: 0.15, distance: 2.25, img: 'mars.png', name: 'mars' });
  solarSystem.add(mars);

  const asteroidBelt = getAsteroidBelt(objs);
  solarSystem.add(asteroidBelt);

  const jupiter = getPlanet({ size: 0.4, distance: 2.75, img: 'jupiter.png', name: 'jupiter'});
  solarSystem.add(jupiter);

  const sRingGeo = new THREE.TorusGeometry(0.6, 0.15, 8, 64);
  const sRingMat = new THREE.MeshStandardMaterial();
  const saturnRing = new THREE.Mesh(sRingGeo, sRingMat);
  saturnRing.scale.z = 0.1;
  saturnRing.rotation.x = Math.PI * 0.5;
  const saturn = getPlanet({ children: [saturnRing], size: 0.35, distance: 3.25, img: 'saturn.png',  name: 'saturn' });
  solarSystem.add(saturn);

  const uRingGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 64);
  const uRingMat = new THREE.MeshStandardMaterial();
  const uranusRing = new THREE.Mesh(uRingGeo, uRingMat);
  uranusRing.scale.z = 0.1;
  const uranus = getPlanet({ children: [uranusRing], size: 0.3, distance: 3.75, img: 'uranus.png',  name: 'uranus'});
  solarSystem.add(uranus);

  const neptune = getPlanet({ size: 0.3, distance: 4.25, img: 'neptune.png', name: 'neptune' });
  solarSystem.add(neptune);

  const elipticLines = getElipticLines();
  solarSystem.add(elipticLines);

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

  const cameraDistance = 5;
  function animate(t = 0) {
    const time = t * 0.0002;
    requestAnimationFrame(animate);
    solarSystem.userData.update(time);
    renderer.render(scene, camera);
    // smooth camera Tracking on target planet
    if (targetPlanet){
      setCameraTarget();
    }
    else
      {
        if (useAnimatedCamera) {
          camera.position.x = Math.cos(time * 0.75) * cameraDistance;
          camera.position.y = Math.cos(time * 0.75);
          camera.position.z = Math.sin(time * 0.75) * cameraDistance;
          camera.lookAt(0, 0, 0);
        } else {
          //controls.target.copy(new THREE.Vector3(0,0,0))
          controls.update();
      }
    }
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

// Should be called to update information on successful click.
function updatePlanetUI(name, description, avgTemp, hospitable){
  document.getElementsByClassName('planet-name')[0].textContent = name;
  document.getElementsByClassName('planet-description')[0].textContent = description;
  document.getElementsByClassName('avg-temp')[0].textContent = avgTemp;
  document.getElementsByClassName('hospitable')[0].textContent =  hospitable;
}
function showPlanetUI(){
  document.querySelector('.planet-info').style.visibility = 'visible';
}

function hidePlanetUI(){
  document.querySelector('.planet-info').style.visibility = 'hidden';
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

      // Define where the camera should hover relative to the planet
      const idealCameraPos = new THREE.Vector3(
        planetWorldPos.x + 1,
        planetWorldPos.y + 0.8, 
        planetWorldPos.z + 1
      );

      // Smoothly interpolate (lerp) camera and control target towards the planet
      // 0.05 controls the speed (lower = smoother/slower, higher = snappier)
      camera.position.lerp(idealCameraPos, 0.05);
      controls.target.lerp(planetWorldPos, 0.05);
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
  console.log(activeClickables);
  
  // Determines what the ray intersects
  const intersects = raycaster.intersectObjects(scene.children, true);


  if(intersects.length > 0){
    // The closest clicked Object will always be 0
    let clickedObj = intersects[0].object;

    // climb up the tree until we find the parent that IS in your array!
    while (clickedObj && !activeClickables.includes(clickedObj) && clickedObj.parent) {
        clickedObj = clickedObj.parent;
    }

    // Now that we have the actual registered planet mesh:
    if (clickedObj && clickedObj.userData.name) {
        
        targetPlanet = clickedObj;
        updatePlanetUI(
          clickedObj.userData.name, 
          clickedObj.userData.description, 
          clickedObj.userData.temp, 50);
        showPlanetUI();
    }
  
  }
  else{
    targetPlanet = null;
    hidePlanetUI();
  }
});