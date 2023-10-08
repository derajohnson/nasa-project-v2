const fs = require('fs');
const path = require('path')
const planets = require('./planets.mongo')

const {parse} = require('csv-parse')


function isHabitablePlanet (planet) {
    return planet.koi_disposition === 'CONFIRMED' && planet.koi_insol > 0.36 && planet.koi_insol < 1.11 && planet.koi_prad < 1.6;
}

function loadPlanets(){
    return new Promise ((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true
        }))
        .on('data', async (data) => {
            if(isHabitablePlanet(data)){
               savePlanet(data)
            }
        })
        .on('error', (error) => {
            console.log(error)
            reject(error)
        })
        .on('end', async ()=> {
            const countPlanets = (await getAllPlanets()).length;
            console.log(`${countPlanets} habitable planets found!`)
            resolve()
        })
    })
}

async function getAllPlanets () {
    return await planets.find({}, {'__v': 0})
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            kepler_name: planet.kepler_name
        },
        {
            kepler_name: planet.kepler_name
        },
        {
            upsert: true
        }
        );
    } catch (error) {
        console.error(`planet could not be saved ${error}`)
    }

}

module.exports = {
    loadPlanets,
    getAllPlanets
}

