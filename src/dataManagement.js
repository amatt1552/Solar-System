
const storageID = "jish";
export function saveGalaxies(){
    const galaxies = Array.from(galaxiesMap.values());
    const galaxyJsons = createJson(galaxies);
    localStorage.setItem(storageID, galaxyJsons);
}
export function createJson(galaxies)
{
    const fullJson = [];
    galaxies?.forEach((galaxy)=>{
        let galaxyJson = {
            "name": galaxy.name,
            "type": galaxy.type,
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "solarSystems": []
        }

        galaxy.solarSystems?.forEach((solarSystem) => {
            let solarSystemJson = {
                "name": solarSystem.name,
                "position": solarSystem.position,
                "sun": solarSystem.sun,
                "planets":[]
            };
                

            solarSystem.planets?.forEach((planet) => {
                let planetJson = {
                    "stats": planet.stats,
                    "size": planet.size,
                    "distance": planet.distance,
                    "model": planet.model,
                    "texture": planet.texture,
                    "ring": planet.ring,
                    "moons": []
                };

                planet.moons?.forEach((moon) =>{
                    const moonJson = {
                    "stats": moon.stats,
                    "size": moon.size,
                    "distance": moon.distance,
                    "model": moon.model,
                    "texture": moon.texture
                    };
                    planetJson.moons.push(moonJson);
                });
                solarSystemJson.planets.push(planetJson);
            });
            galaxyJson.solarSystems.push(solarSystemJson);
        });
        fullJson.push(galaxyJson);
    });
    return JSON.stringify(fullJson);
}

export function jsonToGalaxies(convertedJson){
    const galaxiesData = JSON.parse(convertedJson);
    
    console.log("parsed json", galaxiesData);

    galaxiesData?.forEach((galaxy) =>{
        const createdGalaxy = new Galaxy(
            galaxy.name,
            galaxy.type,
            galaxy.position,
            []
        );
        
        // This array of solarsystems is needed for the created galaxy. the [] needs to be filled. 
        const createdSolarSystems = [];
        galaxy.solarSystems.forEach((solarSystem) => {
            const createdSolarSystem = new SolarSystem(
                createdGalaxy, 
                solarSystem.name,
                solarSystem.position,
                null,
                []
            );
            
            const createdPlanets = [];
            solarSystem.planets.forEach((planet) => {
                const createdPlanet = new Planet(
                    createdSolarSystem,
                    planet.stats,
                    planet.size,
                    planet.distance,
                    planet.model,
                    planet.texture,
                    null,
                    []
                );

                const createdMoons = [];
                planet.moons.forEach((moon) =>{
                    const createdMoon = new Moon(
                        createdPlanet,
                        moon.stats,
                        moon.size,
                        moon.distance,
                        moon.model,
                        moon.texture
                    );
                    // Adds to list needed by created planet.
                    createdMoons.push(createdMoon);
                });

                // Updates values in planets when forloop for moons is done. 
                createdPlanet.ring = new Ring({
                    planet: createdPlanet, 
                    type: createdPlanet.type, 
                    scale: createdPlanet.scale,
                    asteroidFullModels: createdPlanet.asteroidFullModels, 
                    asteroidSizeRange: createdPlanet.asteroidSizeRange, 
                    asteroidDistanceRange: createdPlanet.asteroidDistanceRange,
                    fullModel: createdPlanet.fullModel,
                    dimensions: createdPlanet.dimensions
                });
                createdPlanet.moons = createdMoons;
                console.log("created mono", createdMoons);
                // Adds to list needed by created solar system.
                createdPlanets.push(createdPlanet);
            });
            
            // Updates values in solar system when forloop for planets and moons is done. 
            createdSolarSystem.sun = new Sun(
                createdSolarSystem, 
                solarSystem.sun.name,
                solarSystem.sun.size,
                solarSystem.sun.temperature
            );
            createdSolarSystem.planets = createdPlanets;
            // Adds to list needed by created galaxy.
            createdSolarSystems.push(createdSolarSystem);
        });
        // Adds solar systems to galaxy after all for loops besides galaxy are done.
        createdGalaxy.solarSystems = createdSolarSystems;
        
        
    });
}

export function getGalaxies(){
    const galaxyJson = localStorage.getItem(storageID);
    jsonToGalaxies(galaxyJson);

}

export function deleteGalaxy(galaxyID){
    //localStorage.removeItem(galaxyID)
    const galaxy = galaxiesMap.get(galaxyID);
    // Removes all solar systems in map and array connected to this galaxy
    galaxy.solarSystems?.forEach((solarSystem) =>{
        deleteSolarSystem(solarSystem.id);
    });
    galaxy.solarSystems = null;

    // Removes galaxy from map.
    galaxiesMap.delete(galaxyID);
}

export function deleteSolarSystem(solarSystemID){
    const solarSystem = solarSystemsMap.get(solarSystemID);
    // Removes all planets in map and array connected to this solar system
    solarSystem.planets?.forEach((planet) =>{
        deletePlanet(planet.id);
    });
    solarSystem.planets = null;
    
    // Removes solarsystem from parent galaxy's array.
    const galaxy = solarSystem.galaxy;
    const newSolarSystems = galaxy.solarSystems.filter(solarSystem => solarSystem.id !== solarSystemID);
    galaxy.solarSystems = newSolarSystems;

    // Remove solar system from map
    solarSystemsMap.delete(solarSystemID);
}

export function deletePlanet(planetID){
    const planet = planetsMap.get(planetID);
    // Removes all the moons in map and array connected to this planet
    planet.moons?.forEach((moon) => {
        moonsMap.delete(moon.id);
    });
    planet.moons = null;

    // Removes planet from parent solarSystem's array.
    const solarSystem = planet.solarSystem;
    const newPlanets = solarSystem.planets.filter(planet => planet.id !== planetID);
    solarSystem.planets = newPlanets;

    // Remove Planet from map
    planetsMap.delete(planetID);
}

export function deleteMoon(moonID){
    const moon = moonsMap.get(moonID);

    // Removes moon from parent planet's array
    const planet = moon.planet;
    const newMoons = planet.moons.filter(moon => moon.id !== moonID);
    planet.moons = newMoons;

    // Removes moon from map
    moonsMap.delete(moonID);
}

let fullArray;
/**
 * Takes data and returns an array of the data and its children.
 * @param {Object} data - galaxy, solarsystem, planet, or moon.
 */
export function fullTraversal(data, parent = true){
    // This is what initializes the array. should only happen once.
    if(parent){
        fullArray = [];
        fullArray.push(data);
    }

    data.solarSystems?.forEach((solarSystem) =>{
        fullArray.push(solarSystem);
        fullTraversal(solarSystem, false);
    });
    
    data.planets?.forEach((planet) =>{
        fullArray.push(planet);
        fullTraversal(planet, false);
    });

    data.moons?.forEach((moon) =>{
        fullArray.push(moon);
    });

    return fullArray;
}

// ----------------- Classes --------------------

export const galaxiesMap = new Map();
// Used to create id for galaxies
let galaxyID = 0;
export class Galaxy{
    constructor(name = "Unknown", type = 0, position = {x:0, y:0, z:0}, solarSystems = []){
        this.id = "g" + galaxyID;
        galaxyID++;
        if(name === "")
            this.name = "Unknown"
        else
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
         if(name === "")
            this.name = "Unknown"
        else
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
    constructor(solarSystem, name = "unknown", size = 1, temperature = 1000){
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
    toJSON() {
        
        return {
            id: this.id,
            name: this.name,
            size: this.size,
            temperature: this.temperature
        };
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
        asteroidFullModels = [{model:null, texture:null}], 
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
        this.fullModel = fullModel;
        this.dimensions = dimensions;
    }
    toJSON() {
        
        return {
            id: this.id,
            type: this.type,
            scale: this.scale,
            asteroidFullModels: this.asteroidFullModels,
            asteroidSizeRange: this.asteroidSizeRange,
            asteroidDistanceRange: this.asteroidDistanceRange,
            model: this.model,
            dimensions: this.dimensions
        };
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
        if(name === "")
            this.name = "Unknown"
        else
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