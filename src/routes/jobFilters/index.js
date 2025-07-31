const express = require('express')
const router = express.Router()
const moment = require('moment')

const JobFilter = require('../../models/JobFilter')

// GET

router.get('/users/:userID', async (req, res) => {
    const {userID} = req.params

    const filter = {user: userID}

    try {
        const jobFilters = await JobFilter.find(filter)
            .sort('-createdAt')
            .lean()

        console.log(JSON.stringify(
            {jobFilters: jobFilters || 'no saved filters'}
        , null, 4))

        res.json(jobFilters)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }  
})

// POST

router.post('/', async (req, res) => {
    const {userID, title, filters} = req.body

    const jobFilter = JobFilter({
        user: userID,
        title,
        ...filters
    })

    try {
        await jobFilter.save()

        res.json({
            message: 'Successfully saved job filter',
            filterID: jobFilter._id
        })
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