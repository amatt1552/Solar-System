import * as THREE from 'three';
import { getFresnelMat } from './getFresnelMat.js';
import { setClickable } from './setClickables.js';

const texLoader = new THREE.TextureLoader();
const geo = new THREE.IcosahedronGeometry(1, 6);
function getChild({distance = 0, img = '', size = 1, name = "greeble", description = "all greebles greeb."}) {
  

  

  const path = `./textures/${img}`;
  const map = texLoader.load(path);
  const planetMat = new THREE.MeshStandardMaterial({
    map,
  });
  const planet = new THREE.Mesh(geo, planetMat);
  planet.scale.setScalar(size);

  //Setting the info for the planet
  planet.userData = {name: name, description: description, temp: 5, distance: distance};

  const planetRimMat = getFresnelMat({ rimHex: 0xffffff, facingHex: 0x000000 });
  const planetRimMesh = new THREE.Mesh(geo, planetRimMat);
  planetRimMesh.scale.setScalar(1.01);

  planet.add(planetRimMesh);

  const rate = Math.random() * 1 - 1.0;
  planet.userData.update = (t) => {
    planet.rotation.y = t * rate;
  };

  
  setClickable(planet);
  

  
  return planet;
}
export default getChild;