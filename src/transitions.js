
export const Direction = Object.freeze({
    LEFT:0,
    RIGHT:1,
    UP:2,
    DOWN:3
});

// Moves window off/on screen
export function panWindow(element, totalTime, direction = Direction.RIGHT, amount = 100){
   
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
}
