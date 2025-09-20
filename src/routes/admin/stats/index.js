const express = require('express')
const router = express.Router()
const moment = require('moment')

const Application = require('../../../models/Application')
const Company = require('../../../models/Company')
const Job = require('../../../models/Job')
const Event = require('../../../models/Event')
const { EVENTS } = require('../../events/constants')

router.get('/site-stats', async (req, res) => {
    try {
        const applicationsCount = await Application.countDocuments()
        const companiesCount = await Company.countDocuments()
        const jobsCount = await Job.countDocuments()

        res.json({
            applicationsCount,
            companiesCount,
            jobsCount
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/events', async (req, res) => {
    const {timeframe} = req.query

    const timeframeFilter = {
        day: {
            createdAt: {
                $gte: moment().startOf('day').toDate()
            }
        },
        week: {
            createdAt: {
                $gte: moment().subtract(1, 'week').toDate()
            }
        },
        month: {
            createdAt: {
                $gte: moment().subtract(1, 'month').toDate()
            }
        },
        year: {
            createdAt: {
                $gte: moment().subtract(1, 'year').toDate()
            }
        },
        alltime: {},
    }[timeframe]
    
    try {
        const events = Object.values(EVENTS)
        const eventsData = []

        for (let i = 0; i < events.length; i++) {
            const eventID = events[i]
            console.log(eventID || 'no event id')
            const eventCount = await Event.countDocuments({
                event: eventID,
                ...timeframeFilter
            })

            eventsData.push({event: eventID, count: eventCount})
        }

        eventsData.sort((a, b) => b.count - a.count)

        console.log(JSON.stringify(
            {timeframe, eventsData}
        , null, 4))

        res.json(eventsData)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/event-stats', async (req, res) => {
    const {eventID, timeframe} = req.query

    try {
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router