const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const api = require('./routes/v1')

const app = express()

app.use(cors({
    origin: 'http://localhost:3001'
}))

app.use(morgan('combined'))


app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'public')))


app.use('/v1', api)


module.exports = app




