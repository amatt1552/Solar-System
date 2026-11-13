import {translateHide, translateShow, Direction} from "./transitions.js";
import { transitionTime } from "./globalVars.js";
const simpleAddMenu = document.getElementById("simple-add-menu");
const simpleAddHeader = document.getElementById("simple-add-header");
const simpleAddInput = document.getElementById("simple-add-input");

export function initSimpleWindow(){
    hideSimpleWindow(0.1);
}

export function showSimpleWindow(headerTitle){
    simpleAddHeader.textContent = headerTitle;
    simpleAddInput.value = null;
    simpleAddInput.focus();
    translateShow(simpleAddMenu, transitionTime);
}

/**
 * 
 * @param {number} newTime - sets transition to newTime if not set to null.
 */
export function hideSimpleWindow(newTime = null){
    let selectedTransition = transitionTime;
    if(newTime) selectedTransition = newTime;
    translateHide(simpleAddMenu, selectedTransition, Direction.DOWN, 150);
}