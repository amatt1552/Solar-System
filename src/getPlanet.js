import * as THREE from 'three';
import { getFresnelMat } from './getFresnelMat.js';
import { setClickable } from './setClickables.js';
import { getPlanetInfo } from './getPlanetInfo.js'

const texLoader = new THREE.TextureLoader();
let geo = null;
function getPlanet({ 
  children = [], 
  ring = null, 
  rotationSpeed = 1, 
  orbitSpeed = 1, 
  ringRotationSpeed = 1,
  distance = 0, 
  useModel = false,
  model = null,
  img = '', 
  size = 1, 
  name = "Unknown", 
  description = "This planet is very mysterious. No one knows what is in store."
} = {}) {
  if(useModel && model){
      geo = model;
  } else {
    geo = new THREE.IcosahedronGeometry(1, 6)
  }

  const orbitGroup = new THREE.Group();
  const planetOrbitGroups = [];
  orbitGroup.rotation.x = Math.random() * Math.PI * 2;

  const path = `./textures/${img}`;
  const map = texLoader.load(path);
  const planetMat = new THREE.MeshStandardMaterial({
    map,
  });
  const planet = new THREE.Mesh(geo, planetMat);
  planet.scale.setScalar(size);

  // Setting the info for the planet's UI
  console.log(name);
  const planetInfo = getPlanetInfo({name: name, description: description});
  console.log (planetInfo.name);
  // Saves into userData. since is parent wont need anything else.
  planet.userData = {planetInfo: planetInfo};
  const startAngle = Math.random() * Math.PI * 2;

 
  planet.position.x = Math.cos(startAngle) * distance;
  planet.position.z = Math.sin(startAngle) * distance;

  // Sets ring to same position as planet.
  if(ring){
    ring.position.x = Math.cos(startAngle) * distance;
    ring.position.z = Math.sin(startAngle) * distance;
    orbitGroup.add(ring);
  }

  const planetRimMat = getFresnelMat({ rimHex: 0xffffff, facingHex: 0x000000 });
  const planetRimMesh = new THREE.Mesh(geo, planetRimMat);
  planetRimMesh.scale.setScalar(1.01);

  planet.add(planetRimMesh);
  children.forEach((child) => {
    const childDistance = child.userData.distance;
    
    // Creates a group with the pivot being at the planet's center.
    const planetOrbitGroup = new THREE.Group();
    planetOrbitGroup.position.x = planet.position.x;
    planetOrbitGroup.position.y = planet.position.y;
    planetOrbitGroup.position.z = planet.position.z;
    // Gives it a random starting rotation
    planetOrbitGroup.rotation.x = Math.random() * Math.PI * 2;
    // Adds new group to an array so I can access later
    planetOrbitGroups.push(planetOrbitGroup);
    // Adds to group before changing position so changing position is based on the new local position.
    planetOrbitGroup.add(child);

    // Sets distance from planet
    child.position.x = Math.cos(startAngle) * childDistance;
    child.position.z = Math.sin(startAngle) * childDistance;

    // Adds to new group to main group
    orbitGroup.add(planetOrbitGroup)
  });

  const rate = Math.random() * 1 - 1.0;
  orbitGroup.userData.update = (t) => {
    orbitGroup.rotation.y = t * rate * orbitSpeed;
    planet.rotation.z = t * rate * rotationSpeed;
    if(ring){
      ring.rotation.z = t * rate * ringRotationSpeed;
    }
    for(let i = 0; i < children.length; i ++) {
      children[i].userData.update?.(t);
      planetOrbitGroups[i].rotation.y = t * rate * children[i].userData.orbitSpeed;
    }
  };

  
  setClickable(planet);
  

  orbitGroup.add(planet);
  return orbitGroup;
}
export default getPlanet;