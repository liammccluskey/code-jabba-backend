const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')

// Middleware
app.use(cors())
app.use(express.json())

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