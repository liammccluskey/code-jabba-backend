const express = require('express')
const router = express.Router()
const moment = require('moment')

const Job = require('../../models/Job')

router.get('/landing-stats', async (req, res) => {
    const todaysJobsFilter = {
        createdAt: { $gte: moment().startOf('day').toDate() }
    }
    try {
        const totalActiveJobsCount = await Job.countDocuments({archived: false})
        const jobsPostedTodayCount = await Job.countDocuments(todaysJobsFilter)

        res.json({
            totalActiveJobsCount,
            jobsPostedTodayCount
        }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router