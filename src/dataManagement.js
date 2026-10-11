
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
            "solar_systems": [],
        }

        galaxy.solarSystems.forEach((solarSystem) => {
            let solarSystemJson = {
                "name": solarSystem.name,
                "position": solarSystem.position,
                "sun": null,
                "planets":[],
            };
            solarSystemJson.sun = {
                "name": solarSystem.sun.name,
                "type": solarSystem.sun.type,
                "size": solarSystem.sun.size,
                "temperature": solarSystem.sun.temperature
            }

            solarSystem.planets.forEach((planet) => {
                let planetJson = {
                    "name": planet.name,
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
                    "name": moon.name,
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
var galaxiesMap = new Map();
export class Galaxy
{
    constructor(name, type, position, solarSystems){
        this.id = "g" + galaxiesMap.size;
        this.name = name;
        this.type = type;
        this.position = position;
        this.solarSystems = solarSystems;
        galaxiesMap.set(this.id, this);
    }
}
var solarSystemsMap = new Map();
export class SolarSystem
{
    constructor(galaxy, name, position, sun, planets)
    {
        this.galaxy = galaxy;
        this.id = galaxy.id + "_s" + solarSystemsMap.size;
        this.name = name;
        this.position = position;
        this.sun = sun;
        this.planets = planets;
        solarSystemsMap.set(this.id, this);
    }
}
var planetsMap = new Map();
export class Planet{
    constructor(
        solarSystem,
        size,
        distance,
        model,
        texture,
        ring,
        moons
    ){
        this.solarSystem = solarSystem;
        this.id = solarSystem.id + "_p" + planetsMap.size;
        this.size = size;
        this.distance = distance;
        this.model = model;
        this.texture = texture;
        this.ring = ring;
        this.moons = moons;
        planetsMap.set(this.id, this);
    }
}

export class Sun{
    constructor(solarSystem, name, size, temperature){
        this.solarSystem = solarSystem;
        this.id = solarSystem.id + "_s0";
        this.name = name;
        this.size = size;
        this.temperature = temperature;
    }
}

export class Ring{
    constructor(planet, type, model, dimensions, scale){
        this.planet = planet;
        this.id = planet.id + "_r0";
        this.type = type;
        this.model = model;
        this.dimensions = dimensions;
        this.scale = scale;
    }
}
var moonsMap = new Map();
export class Moon{
    constructor(planet, name, size, distance, model, texture){
        this.planet = planet
        this.id = planet.id + "_m" + moonsMap.size;
        this.name = name;
        this.size = size;
        this.distance = distance;
        this.model = model;
        this.texture = texture;
        moonsMap.set(this.id, this);
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
        atmosphere = ["Unknown"],
        presencesSummary = "Unknown",
        cities = ["Unknown"],
        moons = []
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
        this.moons = moons;
    }
}