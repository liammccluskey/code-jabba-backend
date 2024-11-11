const express = require('express')
const router = express.Router()

const Event = require('../../models/Event')
const {logEvent} = require('./utils')

router.post('/', async (req, res) => {
    const {eventID, userID=undefined} = req.body

    try {
        logEvent(eventID, userID)

        res.json({message: 'Event logged.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})


module.exports = router