import * as THREE from "three";
export function getPlanetInfo({
    name = "Unknown", 
    description = "This planet is unknown to anyone.",
    biomes = "Unknown",
    averageTemp = "Unknown",
    gravity = "Unknown",
    dayLength = "Unknown",
    composition = "Unknown",
    dangerLevel = 3,
    atmosphere = ["Unknown"],
    presencesSummary = "Unknown",
    cities = ["Unknown"],
    isMoon = false,
    moons = []
} = {}){
    return new PlanetInfo(
        name, 
        description, 
        biomes, 
        averageTemp, 
        gravity, 
        dayLength, 
        composition, 
        dangerLevel, 
        atmosphere, 
        presencesSummary, 
        cities,
        isMoon, 
        moons);
}
class PlanetInfo
{
    constructor(
        name, 
        description,
        biomes,
        averageTemp,
        gravity,
        dayLength,
        composition,
        dangerLevel,
        atmosphere,
        presencesSummary,
        cities,
        isMoon,
        moons
    ){
        this.name = name; 
        this.description = description;
        this.biomes = biomes;
        this.averageTemp = averageTemp;
        this.gravity = gravity;
        this.dayLength = dayLength;
        this.composition = composition;
        switch(dangerLevel){
            case 0:
                this.dangerLevel = "safe";
                this.dangerColor = "green";
                break;
            case 1:
                this.dangerLevel = "moderate";
                this.dangerColor = "yellow";
                break;
            case 2:
                this.dangerLevel = "hazardous";
                this.dangerColor = "red";
                break;
            default:
                this.dangerLevel = "unknown";
                this.dangerColor = "white";
                break;
        }
        this.atmosphere = atmosphere;
        this.presencesSummary = presencesSummary;
        this.cities = cities;
        this.isMoon = isMoon
        this.moons = moons;
    }
}
export default getPlanetInfo;
