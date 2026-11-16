import { fadeShow, fadeHide } from "./transitions.js";
import { transitionTime } from "./globalVars.js";

const confirmationOuter = document.getElementById("confirmation-outer");
const deletedList = document.getElementById("deleted-list");
const confirmButton = document.getElementById("popup-button-confirm");
const cancelButton = document.getElementById("popup-button-cancel");

export function showConfirmation(dataList){
    fadeShow(confirmationOuter, transitionTime);
    deletedList.replaceChildren();
    dataList.forEach((data) =>{
        const element = document.createElement("li");
        const name = data.name? data.name : data.stats.name;
        element.textContent = name;
        deletedList.appendChild(element);
    });
}

export function hideConfirmation(){
    fadeHide(confirmationOuter, transitionTime);
}

let confirmController;
export function setConfirmListener(passedFunction){
    confirmController?.abort();
    confirmController = new AbortController();
    confirmButton.addEventListener("click", 
        passedFunction,
        {signal: confirmController.signal}
    );
}
// this wont be connected to the controller as it only needs to add once.
confirmButton.addEventListener("click", hideConfirmation);
cancelButton.addEventListener("click", hideConfirmation); 
