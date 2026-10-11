// Adds one option to sidebar using data.
// Data should be a galaxy, solarsystem, sun, planet, or moon
export function addSelection(data){
    const selectionGroup = document.getElementById("sidebar-selection-group");
    const button = document.createElement("button");
    button.textContent = data.name;
    button.classList.add("galaxy-selection");
    button.id = data.id;
    selectionGroup.appendChild(button);
    return button;

}

// Clears sidebar menu and adds a list of data.
export function setSelections(dataList){
    const selectionGroup = document.getElementById("sidebar-selection-group");
    selectionGroup.replaceChildren();
    dataList.forEach((data) =>{
        const button = document.createElement("button");
        button.textContent = data.name;
        button.classList.add("galaxy-selection");
        button.id = data.id;
        selectionGroup.appendChild(button);
    });
    return selectionGroup;
}


export default addSelection;