import { translateShow, translateHide, Direction } from "./transitions.js";

const sidebarContainer = document.getElementById("sidebar-container")
const selectionGroup = document.getElementById("sidebar-selection-group");
const hamburger = document.getElementById("sidebar-hamburger");
let isActive = false;
const transitionTime = 0.5;

export function initSideBar(){
    hamburger.classList.add("is-active");
    isActive = true;
}

/** Adds one option to sidebar using data.
* Data should be a galaxy, solarsystem, sun, planet, or moon
*/
export function addSelection(data){
    const button = document.createElement("button");
    button.textContent = data.name;
    button.classList.add("galaxy-selection");
    button.id = data.id;
    selectionGroup.appendChild(button);
    return Array.from(selectionGroup.children);

}

/** Clears sidebar menu and adds a list of data.*/
export function setSelections(dataList){
    
    selectionGroup.replaceChildren();
    dataList.forEach((data) =>{
        const button = document.createElement("button");
        button.textContent = data.name;
        button.classList.add("galaxy-selection");
        button.id = data.id;
        selectionGroup.appendChild(button);
    });
    return Array.from(selectionGroup.children);
}

// Setups colapsing menu with hamburger button.
hamburger.addEventListener("click", () => {
    isActive = !isActive;
    if(isActive){
        hamburger.classList.add("is-active")
        translateShow(sidebarContainer, transitionTime);
    } else {
        hamburger.classList.remove("is-active")
        translateHide(sidebarContainer, transitionTime, Direction.LEFT);
    }
});
export default initSideBar;