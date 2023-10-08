const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require('axios')
const launches = new Map();

const DEFAULT_FLIGHT_NUMBER= 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

// launches.set(launch.flightNumber, launch)

async function getAllLaunches(skip, limit) {
  return await launchesDB.find({}, { __v: 0 })
  .sort({flightNumber: 1})
  .skip(skip)
  .limit(limit)
}



async function getLatestFlightNumber() {
    const latestLaunch = await launchesDB.findOne({}).sort("-flightNumber");
  if(!latestLaunch) {
      return DEFAULT_FLIGHT_NUMBER
  }
  
    return latestLaunch.flightNumber
  
  }

async function scheduleNewLaunch(launch){
  const planet = await planets.findOne({
    kepler_name: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet found");
  }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch =  Object.assign(launch, {
               flightNumber: newFlightNumber,
             success: true,
             upcoming: true,
              customers: ["ZTM", "NASA", "SPACE X"],
            })

            await saveLaunch(newLaunch)
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       success: true,
//       upcoming: true,
//       customers: ["ZTM", "NASA", "SPACE X"],
//     })
//   );
// }

async function saveLaunch(launch) {

  await launchesDB.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

saveLaunch(launch);


async function populateLaunch(){
  console.log('Downloading launch data....')
  const response = await axios.post(SPACEX_API_URL,
   {
       query: {},
       options: {
         pagination: false,
           populate: [
               {
                   path: 'rocket',
                   select: {
                       name: 1
                   }
               },
               {
                   path: 'payloads',
                   select: {
                       'customers': 1
                   }
               }
           ]
       }
   }
   )

   const launchDocs = response.data.docs;
   for(const launchDoc of launchDocs){
     const payloads = launchDoc['payloads'];
     const customers = payloads.flatMap((payload) => {
       return payload['customers']
     })
     const launch = {
       flightNumber: launchDoc['flight_number'],
       mission: launchDoc ['name'],
       rocket: launchDoc['rocket']['name'],
       launchDate: launchDoc['date_local'],
       upcoming: launchDoc['upcoming'],
       success: launchDoc['success'],
       customers
     }
     console.log(`${launch.flightNumber} ${launch.mission}`)
     await saveLaunch(launch)
   }

}

async function loadLaunchData (){
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  })
  if(firstLaunch){
    console.log('Launch data already loaded')
  }else{
    populateLaunch()
  }

}

async function findLaunch(filter){
  return await launchesDB.findOne(filter)
}

async function existsLaunchWithId(launchId){
  return await findLaunch({
    flightNumber: launchId
  })
}


module.exports = {
  getAllLaunches,
loadLaunchData,
  scheduleNewLaunch
};
