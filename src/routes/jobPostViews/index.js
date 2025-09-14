const express = require('express')
const router = express.Router()
const moment = require('moment')

const JobPostView = require('../../models/JobPostView')

// GET

router.get('/daily-applied-count/:userID', async (req, res) => {
    const {userID} = req.params

    if (!userID) {
        res.status(400).json({message: 'You failed to send a valid userID.'})
    }

    const filter = {
        user: userID, 
        didClickApply: true,
        createdAt: {$gte: moment().startOf('day').toDate()}
    }

    try {
        const dailyViewCount = await JobPostView.countDocuments(filter)

        res.json(dailyViewCount)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'An error occurred while fetching you daily job post view count.'})
    }
})

// POST

router.post('/', async (req, res) => {
    const {userID, jobID} = req.body 

    if (!userID || !jobID) {
        res.status(400).json({message: 'You failed to send a valid userID and jobID.'})
    }

    const jobPostView = new JobPostView({
        user: userID,
        job: jobID
    })

    try {
        await jobPostView.save()

        res.status(201).json({message: 'Successfully saved job post view.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Failed to save job post view.'})
    }
})

// PATCH

router.patch('/did-click-apply', async (req, res) => {
    const {userID, jobID} = req.body 

    if (!userID || !jobID) {
        const errorMessage = 'You failed to send a valid userID and jobID.'
        console.log(errorMessage)
        res.status(400).json({message: errorMessage})
    }

    const filter = {user: userID, job: jobID}

    try {
        const jobPostView = await JobPostView.findOneAndUpdate(filter, {didClickApply: true})
            .lean()

        if (!jobPostView) {
            const errorMessage = 'Could not find any job post views that matched those filters.'
            console.log(errorMessage)
            res.status(400).json({message: errorMessage})
            return
        }

        res.json({message: 'Successfully updated job post view.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Failed to save job post view.'})
    }
})

module.exports = router