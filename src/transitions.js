// Enum for direction it hides in.
export const Direction = Object.freeze({
    LEFT:0,
    RIGHT:1,
    UP:2,
    DOWN:3
});


/**
 * Transitions an element off screen with transform.
 * @param {*} direction: 0 = Left, 1 = Right, 2 = Up, 3 = Down. 
 */
export function translateHide(element, totalTime, direction = Direction.RIGHT, amount = 100){
   
    element.style.transition = `transform ${totalTime}s ease`;
    switch(direction){
    case Direction.LEFT:
        element.style.transform = `translateX(-${amount}%)`;
        break; 
    case Direction.RIGHT:
        element.style.transform = `translateX(+${amount}%)`;
        break; 
    case Direction.UP:
        element.style.transform = `translateY(+${amount}%)`;
        break; 
    case Direction.DOWN:
        element.style.transform = `translateY(-${amount}%)`;
        break; 
    }
    translateShow
}
/**
 * Moves element hidden by translateHide back to original position.
 */
export function translateShow(element, totalTime, resetX = true, resetY = true){
    console.log(element);
    element.style.transition = `transform ${totalTime}s ease`;
    if(resetX) element.style.transform = "translateX(0)";    
    if(resetY) element.style.transform = "translateY(0)";    
}

export default translateHide;
