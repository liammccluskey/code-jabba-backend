const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')

const {isAdmin} = require('./src/routes/admin/utils')

// Middleware

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    const apiKey = req.headers['heroku-api-key']

    if (apiKey !== process.env.HEROKU_API_KEY) {
        res.status(500).send({message: 'Invalid api key.'})
    } else {
        next()
    }
})

app.use((req, res, next) => {
    const {originalUrl} = req

    if (originalUrl.split('/')[1] === 'admin') {
        if (isAdmin(req)) {
            next()
        } else {
            res.status(500).json({message: 'This operation requires admin privileges to complete.'})
        }
    } else {
        next()
    }
})

// Routes

const usersRoute = require('./src/routes/users')
app.use('/users', usersRoute)

const notificationsRoute = require('./src/routes/notifications')
app.use('/notifications', notificationsRoute)

const adminUsersRoute = require('./src/routes/admin/users')
app.use('/admin/users/', adminUsersRoute)

mongoose.connect(
    process.env.MONGO_DB_CONNECTION,
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    },
)

const server = app.listen(process.env.PORT || 4006)