const express = require('express')
const router = express.Router()
const moment = require('moment')

const JobFilter = require('../../models/JobFilter')
const {generateMongoFilterFromJobFilters} = require('../jobs/utils')
const Subscription = require('../../models/Subscription')
const {SUBSCRIPTION_TIERS} = require('../../models/Subscription/constants')

// GET

router.get('/users/:userID', async (req, res) => {
    const {userID} = req.params

    const subscriptionFilter = {
        user: userID,
        tier: SUBSCRIPTION_TIERS.candidatePremium,
        status: 'active'
    }

    try {
        const subscriptionCount = await Subscription.countDocuments(subscriptionFilter)

        if (subscriptionCount == 0) {
            res.json([])
            return
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Could not retrieve saved filters.'})
        return
    }

    const filter = {user: userID}

    try {
        const jobFilters = await JobFilter.find(filter)
            .sort('-createdAt')
            .lean()

        const updatedJobFilters = jobFilters.map(filter => ({
            ...filter,
            asMongoFilter: generateMongoFilterFromJobFilters(filter)
        }))

        res.json(updatedJobFilters)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }  
})

// POST

router.post('/', async (req, res) => {
    const {userID, title, filters} = req.body

    delete filters._id

    const jobFilter = JobFilter({
        user: userID,
        title,
        ...filters
    })

    try {
        await jobFilter.save()

        res.json({message: 'Successfully saved job filter'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// DELETE

router.delete('/:filterID', async (req, res) => {
    const {filterID} = req.params

    const filter = {_id: filterID}

    try {
        await JobFilter.deleteOne(filter)

        res.json({message: 'Successfully unsaved filter'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})


module.exports = router