const {getAllLaunches, scheduleNewLaunch} = require('../../models/launches.model')
const getPagination = require('../../services/query')

async function httpGetAllLaunches (req,res) {
    const {skip, limit} = getPagination(req.query)
    const launches = await getAllLaunches(skip,limit)
    return res.status(200).json(Array.from(launches))
}

async function httpAddNewLaunch (req, res){
const launch = req.body;
if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
    return res.status(400).json({
        error: 'Missing required launch property'
    })
}
launch.launchDate = new Date (launch.launchDate)
if(isNaN(launch.launchDate)){
    return res.status(400).json({
        error: 'invalid launch date!!'
    })
}
await scheduleNewLaunch(launch)
return res.status(201).json(launch)
}

module.exports={
    httpGetAllLaunches,
    httpAddNewLaunch
}

