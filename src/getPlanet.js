import * as THREE from 'three';
import { getFresnelMat } from './getFresnelMat.js';
import { setClickable } from './setClickables.js';

const texLoader = new THREE.TextureLoader();
const geo = new THREE.IcosahedronGeometry(1, 6);
function getPlanet({ children = [], ring = null, distance = 0, childDistance = 2, img = '', size = 1, name = "greeble", description = "all greebles greeb."}) {
  

  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.x = Math.random() * Math.PI * 2;

  const path = `./textures/${img}`;
  const map = texLoader.load(path);
  const planetMat = new THREE.MeshStandardMaterial({
    map,
  });
  const planet = new THREE.Mesh(geo, planetMat);
  planet.scale.setScalar(size);

  //Setting the info for the planet
  planet.userData = {name: name, description: description, temp: 5, distance: distance};
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
    const actualDistance = child.userData.distance;
    //console.log(actualDistance);
    child.position.x = planet.position.x + Math.cos(startAngle) * actualDistance;
    child.position.y = planet.position.y;
    child.position.z = planet.position.z + Math.sin(startAngle) * actualDistance;
    orbitGroup.add(child);
  });

  const rate = Math.random() * 1 - 1.0;
  orbitGroup.userData.update = (t) => {
    orbitGroup.rotation.y = t * rate;
    children.forEach((child) => {
      child.userData.update?.(t);
    });
  };

  
  setClickable(planet);
  

  orbitGroup.add(planet);
  return orbitGroup;
}
export default getPlanet;