import {translateHide, translateShow, Direction} from "./transitions.js";

const dataEntryOuter = document.getElementById("data-entry-outer");
let initDone;
export function initDataEntry(){
    dataEntryOuter.style.visibility = 'hidden';
    initDone = false;
    translateHide(dataEntryOuter, 0.1, Direction.RIGHT, 100);
}
dataEntryOuter.addEventListener('transitionend', (event) => {
  if(!initDone){
    dataEntryOuter.style.visibility = 'visible';
    initDone = true;
  }
});
export default initDataEntry;