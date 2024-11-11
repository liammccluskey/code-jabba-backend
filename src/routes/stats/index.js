const express = require('express')
const router = express.Router()

const User = require('../../models/User')
const Application = require('../../models/Application')
const Job = require('../../models/Job')

router.get('/landing-stats', async (req, res) => {
    try {
        const applicationsCount = await Application.countDocuments()
        const jobsCount = await Job.countDocuments({archived: false})
        const candidatesCount = await User.countDocuments({isRecruiter: false})
        const recruitersCount = await User.countDocuments({isRecruiter: true})

        res.json({
            applicationsCount,
            jobsCount,
            candidatesCount,
            recruitersCount
        }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router