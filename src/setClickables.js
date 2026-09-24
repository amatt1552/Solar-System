import * as THREE from 'three';
const clickables = []
export function setClickable(object){
    clickables.push(object);
}
export function getClickable()
{
    return clickables
}