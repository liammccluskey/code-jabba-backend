const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')

// Middleware
const corsOptions = { 
    origin: '*', 
    credentials: true,
    optionSuccessStatus: 200,
 }
app.use(cors(corsOptions))

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.headers)
    const apiKey = req.headers['x-heroku-api-key']
    if (apiKey !== process.env.HEROKU_API_KEY) {
        res.status(500).send({message: 'Invalid api key.'})
        return
    } else {
        next()
    }
})

// Routes
const usersRoute = require('./routes/users')
app.use('/users', usersRoute)

mongoose.connect(
    process.env.DB_CONNECTION,
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    },
    () => {console.log('Connected to DB')}
)

const server = app.listen(process.env.PORT || 3000)