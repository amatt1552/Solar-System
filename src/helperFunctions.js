export function clamp(val, min, max) {
    //if the value of val is higher than min returns val.
    //if the value of val is less than min returns min.
    //if the value of math.max is greater than max returns max.
    return Math.min(Math.max(val, min), max);
}