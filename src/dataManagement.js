
export function createGalaxy(galaxyID, galaxy){
    localStorage.setItem(galaxyID, galaxy);
    localStorage.setItem(galaxyCount)
}
export function createJson(galaxies)
{
    const fullJson = [];
    galaxies.forEach((galaxy)=>{
        let galaxyJson = {
            "name": galaxy.name,
            "type": galaxy.type,
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "solar_systems": []
        }

        galaxy.solarSystems.forEach((solarSystem) => {
            let solarSystemJson = {
                "name": solarSystem.name,
                "position": solarSystem.position,
                "sun": null,
                "planets":[]
            };
            solarSystemJson.sun = {
                "name": solarSystem.sun.name,
                "type": solarSystem.sun.type,
                "size": solarSystem.sun.size,
                "temperature": solarSystem.sun.temperature
            }

            solarSystem.planets.forEach((planet) => {
                let planetJson = {
                    "stats": planet.stats,
                    "size": planet.size,
                    "distance": planet.distance,
                    "model": planet.model,
                    "texture": planet.texture,
                    "ring": null,
                    "moons": []
                };
                if(planetJson.ring){
                    planetJson.ring = {
                        "type": planet.ring.type,
                        "model": planet.ring.model,
                        "dimensions": planet.ring.dimensions,
                        "scale": planet.ring.scale
                    };
                }

                planet.moons.forEach((moon) =>{
                    const moonJson = {
                    "stats": moon.stats,
                    "size": moon.size,
                    "distance": moon.distance,
                    "model": moon.model,
                    "texture": moon.texture
                    };
                    planetJson.moons.push(moonJson)
                });
                solarSystemJson.planets.push(planetJson);
            });
            galaxyJson.solar_systems.push(solarSystemJson);
        });
        fullJson.push(galaxyJson)
    });
    return JSON.stringify(fullJson);
}
export function getGalaxy(galaxyID){
    localStorage.getItem(galaxyID);
}

export function deleteGalaxy(galaxyID){
    localStorage.removeItem(galaxyID)
}

export function deleteSolarSystem(){

}

export function deletePlanet(){

}
export const galaxiesMap = new Map();
// Used to create id for galaxies
let galaxyID = 0;
export class Galaxy{
    constructor(name = "unknown", type = 0, position = {x:0, y:0, z:0}, solarSystems = []){
        this.id = "g" + galaxyID;
        galaxyID++;
        this.name = name;
        this.type = type;
        this.position = position;
        this.solarSystems = solarSystems;
        
        galaxiesMap.set(this.id, this);
    }
    
}

export const solarSystemsMap = new Map();
let solarSystemsID = 0;
export class SolarSystem{
    constructor(galaxy, name = "unknown", position = {x:0,y:0,z:0}, sun = null, planets = [])
    {
        if(!galaxy){
            console.error("Galaxy must be set for solar systems.");
            return null;
        }

        // I Get id early so can check if it exists already in galaxy's solarsystem.
        this.id = galaxy.id + "s" + solarSystemsID;
        if(!galaxy.solarSystems){
            galaxy.solarSystems = [];
        }

        // This prevents making another copy of the same solarsystem in the array.
        // I would use a map to prevent this but arrays tend to work better with UI it seems.
        const hasSolarSystem = galaxy.solarSystems.some(solarSystem => {solarSystem.id === this.id});
        if(!hasSolarSystem) galaxy.solarSystems.push(this);
        
        this.galaxy = galaxy;
        solarSystemsID++;
        this.name = name;
        this.position = position;
        this.sun = sun;
        this.planets = planets;
        
        solarSystemsMap.set(this.id, this);
    }
}

export const planetsMap = new Map();
let planetID = 0
export class Planet{
    constructor(
        solarSystem,
        stats = null,
        size = 1,
        distance = 1,
        model = null,
        texture = null,
        ring = null,
        moons = []
    ){
        if(!solarSystem){
            console.error("Solar System must be set for planets.");
            return null;
        }

        if(!solarSystem.planets){
           solarSystem.planets = [];
        }

        this.id = solarSystem.id + "p" + planetID;
        const hasPlanet = solarSystem.planets.some(planet => {planet.id === this.id});
        if(!hasPlanet) solarSystem.planets.push(this);

        this.solarSystem = solarSystem;
        planetID++;
        this.stats = stats;
        this.size = size;
        this.distance = distance;
        this.model = model;
        this.texture = texture;
        this.modelFile = null;
        this.textureFile = null;
        this.ring = ring;
        this.moons = moons;
        this.convertPathToFile();
        planetsMap.set(this.id, this);
        console.log("planetmap:", planetsMap.entries());
    }

    async convertPathToFile(){
        
        try {
            // Convert Path to File object
            if(this.model){
                const response = await fetch(this.model);
                const blob = await response.blob();
                this.modelFile = new File([blob], "earth",{type:blob.type})
            }
            if(this.texture){
                const response = await fetch(this.texture);
                const blob = await response.blob();
                this.textureFile = new File([blob], "earth.png",{type:blob.type})
            }
            
            console.log("path successfully converted to File!");
        } catch (error) {
            console.error("Failed to convert path to file:", error);
        }
    }
}

export class Sun{
    constructor(solarSystem, name = unknown, size = 1, temperature = 1000){
        if(!solarSystem){
            console.error("Solar System must be set for sun.");
            return null;
        }

        solarSystem.sun = this;
        this.solarSystem = solarSystem;
        this.id = solarSystem.id + "s0";
        this.name = name;
        this.size = size;
        this.temperature = temperature;
    }
}
/**
 * Class for creating a ring around a planet. 
 * @param {Planet} planet - The planet that the ring is around.
 * @param {number} type - The type of ring. Can be 0 for custom, 1 for model, 2 for asteroids. Does nothing on its own. Must be handled in another script.
 * @param {Object[]} asteroidFullModels - An array of objects that contain the model and texture for the asteroids in the ring.
 * @param {Object} fullModel - An object that contains the model and texture for the ring. Only used for type 1.}
 * @param {Object} dimensions - An object that contains the dimensions of the ring. Only used for type 0. Should contain radius, tube, radial_segments, and tubular_segments.
 
 */
export class Ring{
    constructor({planet, type = 0, scale = 1,
        asteroidFullModels = [{Model:null, texture:null}], 
        asteroidSizeRange = {min: 1, max: 3}, 
        asteroidDistanceRange = {min: 1, max: 10},
        fullModel = {model: null, texture: null},
        dimensions = {radius: 0.5, tube: 0.05, radial_segments: 8, tubular_segments: 64}
    }){
        if(!planet){
            console.error("Planets must be set for rings.");
            return null;
        }
        
        planet.ring = this;
        this.planet = planet;
        this.id = planet.id + "r0";
        this.type = type;
        this.scale = scale;
        this.asteroidFullModels = asteroidFullModels;
        this.asteroidSizeRange = asteroidSizeRange;
        this.asteroidDistanceRange = asteroidDistanceRange;
        this.model = fullModel;
        this.dimensions = dimensions;
    }
}

export const moonsMap = new Map();
let moonsID = 0;
export class Moon{
    constructor(planet, stats, size, distance, model, texture){
        if(!planet){
            console.error("Planets must be set for moons.");
            return null;
        }

        if(!planet.moons){
           planet.moons = [];
        }

        this.id = planet.id + "m" + moonsID;
        const hasMoon = planet.moons.some(moon => {moon.id === this.id});
        if(!hasMoon) planet.moons.push(this);


        this.planet = planet
        moonsID++;
        this.stats = stats
        this.size = size;
        this.distance = distance;
        this.model = model;
        this.texture = texture;
        this.modelFile = null;
        this.textureFile = null;
        moonsMap.set(this.id, this);
        this.convertPathToFile();
    }

    async convertPathToFile(){
        
        try {
            // Convert Path to File object
            if(this.model){
                const response = await fetch(this.model);
                const blob = await response.blob();
                this.modelFile = new File([blob], "moon",{type:blob.type})
            }
            if(this.texture){
                const response = await fetch(this.texture);
                const blob = await response.blob();
                this.textureFile = new File([blob], "moon.png",{type:blob.type})
            }
            
            console.log("path successfully converted to File!");
        } catch (error) {
            console.error("Failed to convert path to file:", error);
        }
    }
}


export class Stats{
    constructor({
        name = "Unknown", 
        description = "This planet is unknown to anyone.",
        biomes = "Unknown",
        averageTemp = "Unknown",
        gravity = "Unknown",
        dayLength = "Unknown",
        composition = "Unknown",
        dangerLevel = 3,
        atmosphereStats = ["Unknown"],
        humanoidSummary = "Unknown",
        cities = ["Unknown"]
    } = {}){
        this.name = name; 
        this.description = description;
        this.biomes = biomes;
        this.averageTemp = averageTemp;
        this.gravity = gravity;
        this.dayLength = dayLength;
        this.composition = composition;
        switch(dangerLevel){
            case 0:
                this.dangerLevel = "Safe";
                this.dangerColor = "green";
                break;
            case 1:
                this.dangerLevel = "Moderate";
                this.dangerColor = "yellow";
                break;
            case 2:
                this.dangerLevel = "Hazardous";
                this.dangerColor = "red";
                break;
            default:
                this.dangerLevel = "Unknown";
                this.dangerColor = "white";
                break;
        }
        this.atmosphereStats = atmosphereStats;
        this.humanoidSummary = humanoidSummary;
        this.cities = cities;
    }
}