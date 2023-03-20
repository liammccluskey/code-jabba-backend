const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')

// Middleware

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    const apiKey = req.headers['heroku-api-key']

    if (apiKey !== process.env.HEROKU_API_KEY) {
        res.status(500).send({message: 'Invalid api key.'})
        return
    } else {
        next()
    }
})

// Routes

const usersRoute = require('./src/routes/users')
app.use('/users', usersRoute)

const notificationsRoute = require('./src/routes/notifications')
app.use('/notifications', notificationsRoute)

mongoose.connect(
    process.env.MONGO_DB_CONNECTION,
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    },
)

const server = app.listen(process.env.PORT || 4005)