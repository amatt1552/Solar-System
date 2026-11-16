// Enum for direction it hides in.
export const Direction = Object.freeze({
    LEFT:0,
    RIGHT:1,
    UP:2,
    DOWN:3
});

/**
 * Fades element out to hide element. Hides the display when complete.
 * @param {Number} totalTime - Transition time in seconds.
 */
export function fadeHide(element, totalTime){
    const animation = fadeElement(element, 1, 0, totalTime);

    animation.onfinish = () => {
        element.style.display = "none";
    };
}

/**
 * Fades element out to hide element. Hides the display when complete.
 * @param {Number} totalTime - Transition time in seconds.
 * @param {String} display - sets the display type. flex, none, block, etc.
 */
export function fadeShow(element, totalTime, display = "block"){
    element.style.display = display;
    fadeElement(element, 0, 1, totalTime);
}

/**
 * 
 * @param {*} element 
 * @param {Number} start - Opacity at start.
 * @param {Number} end -Opacity at end.
 * @param {Number} totalTime - Transition time in seconds.
 * @returns 
 */
function fadeElement(element, start, end, totalTime){
    const animation = element.animate(
        [{ opacity: start }, { opacity: end }], { 
            duration: totalTime * 1000, 
            easing: "ease-out",
            fill: "forwards" 
        }
    );
    return animation
}


/**
 * Transitions an element off screen with transform.
 * @param {*} direction: 0 = Left, 1 = Right, 2 = Up, 3 = Down. 
 */
export function translateHide(element, totalTime, direction = Direction.RIGHT, amount = 100){
   
    element.style.transition = `transform ${totalTime}s ease-in`;
    switch(direction){
        case Direction.LEFT:
            element.style.transform = `translateX(-${amount}%)`;
            break; 
        case Direction.RIGHT:
            element.style.transform = `translateX(+${amount}%)`;
            break; 
        case Direction.UP:
            element.style.transform = `translateY(-${amount}%)`;
            break; 
        case Direction.DOWN:
            element.style.transform = `translateY(+${amount}%)`;
            break; 
    }
}
/**
 * Moves element hidden by translateHide back to original position.
 */
export function translateShow(element, totalTime, resetX = true, resetY = true){
    element.style.transition = `transform ${totalTime}s ease`;
    if(resetX) element.style.transform = "translateX(0)";    
    if(resetY) element.style.transform = "translateY(0)";    
}

export default translateHide;
