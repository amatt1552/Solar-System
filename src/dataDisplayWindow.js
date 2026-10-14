import {translateHide, translateShow, Direction} from "./transitions.js";
const dataDisplayOuter = document.getElementById("data-display-outer");
let initDone;
const transitionTime = 0.5;

export function initDataDisplay(){
    dataDisplayOuter.style.visibility = 'hidden';
    initDone = false;
    translateHide(dataDisplayOuter, 0.1, Direction.RIGHT, 100);
}
dataDisplayOuter.addEventListener('transitionend', (event) => {
  if(!initDone){
    dataDisplayOuter.style.visibility = 'visible';
    initDone = true;
  }
});

export function showData(){
  const planetInfo = document.getElementById('data-display-outer');
  translateShow(planetInfo, transitionTime);
}

export function hideData(){
  const planetInfo = document.getElementById('data-display-outer');
  translateHide(planetInfo, transitionTime, Direction.RIGHT);
}

export default initDataDisplay;
