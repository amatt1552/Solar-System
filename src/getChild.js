import * as THREE from 'three';
import { getFresnelMat } from './getFresnelMat.js';
import { setClickable } from './setClickables.js';
import { getPlanetInfo } from './getPlanetInfo.js';

const texLoader = new THREE.TextureLoader();
let geo = null;
function getChild({
  useRim = true, 
  distance = 0, 
  useModel = false, 
  model = null,
  img = '', 
  rotationSpeed = 1, 
  orbitSpeed = 1, 
  size = 1, 
  name = "Unknown", 
  description = "This moon has been unexplored. What could be hiding here?"
} = {}) {
  
  if(useModel && model){
    geo = model;
  } else {
    geo = new THREE.IcosahedronGeometry(1, 6)
  }
  const path = `./textures/${img}`;
  const map = texLoader.load(path);
  const childMat = new THREE.MeshStandardMaterial({
    map,
  });
  const child = new THREE.Mesh(geo, childMat);
  child.scale.setScalar(size);

  // Setting the info for the UI for the child.
  const childInfo = getPlanetInfo({name: name, description: description});
  // Adds variables the parent will need.
  child.userData = {planetInfo: childInfo, distance: distance, orbitSpeed: orbitSpeed};
  if(useRim){
    const childRimMat = getFresnelMat({ rimHex: 0xffffff, facingHex: 0x000000 });
    const childRimMesh = new THREE.Mesh(geo, childRimMat);
    childRimMesh.scale.setScalar(1.01);

    child.add(childRimMesh);
  }

  const rate = Math.random() * 1 - 1.0;
  child.userData.update = (t) => {
    child.rotation.y = t * rate * rotationSpeed;
  };

  
  setClickable(child);
  

  
  return child;
}
export default getChild;