import axios from 'axios'

const API_URL = 'http://localhost:8080/v1'

async function httpGetPlanets() {
 const response = await axios.get(`${API_URL}/planets`)
 return await response.data
}



async function httpGetLaunches() {
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
  const response = await axios.get(`${API_URL}/launches`)
  const fetchedLaunches = await response.data

  return fetchedLaunches.sort((a,b) => {
    return a.flightNumber - b.flightNumber
  }
  
  )
}

async function httpSubmitLaunch(launch) {
  const response = await axios.post(`${API_URL}/launches`,{
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(launch)
  })
}

async function httpAbortLaunch(id) {
  const response = await axios.delete(`${API_URL}/launches/${id}`)
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};