const express = require('express')
const router = express.Router()
const moment = require('moment')

const Job = require('../../models/Job')
const Application = require('../../models/Application')
const {PAGE_SIZES, MAX_PAGE_SIZE} = require('../../constants')
const {transformJob} = require('../../models/Job/utils')

// GET Routes
/*
    - required query fields:
        - page
    - optional query fields:
        - pagesize
*/
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.companySearch,
        page,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
    }

    try {
        const count = await Job.countDocuments(filter)
        const jobs = await Job.find(filter)
            .sort({name: 1})
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('name')
            .lean()

        res.json({
            jobs,
            canLoadMore: jobs.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// GET Routes
/*
    - required query fields:
        - page
        - userID
        - sortBy
    - optional query fields:
        - pagesize
        - name
        - isAdmin
*/
router.get('/recruiter-search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.jobSearch,
        page,
        userID,
        sortBy,
        archived=undefined,
        title=undefined,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        ...(title ? 
            {
                $text: {
                    $search : title
                }
            } : {}
        ),
        ...(archived ?
            {archived}
            : {}
        ),
        recruiter: userID
    }

    try {
        const count = await Job.countDocuments(filter)
        const jobs = await Job.find(filter)
            .sort(sortBy)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('title archived createdAt')
            .populate('company', 'name')
            .lean()

        res.json({
            jobs,
            pagesCount: Math.ceil(count / pageSize),
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/:jobID', async (req, res) => {
    const {jobID} = req.params
    const {userID} = req.query

    const applicationFilter = {
        job: jobID,
        candidate: userID
    }

    try {
        const job = await Job.findById(jobID)
            .populate('company', 'name rating reviewCount')
            .populate('recruiter', 'displayName photoURL')
            .lean()

        const applications = await Application.find(applicationFilter)
            .lean()

        if (job) {
            job.applied = applications.length > 0
            res.json(job)
        } else {
            throw new Error('No jobs matched those filters.')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'No jobs matched those filters.'})
    }
})

// POST Routes
router.post('/', async (req, res) => {
    const {userID, job} = req.body

    const updatedJob = new Job(transformJob(job, userID, true))

    try {
        await updatedJob.save()

        res.json({
            message: `Successfully created job ${job.title}.`,
            jobID: updatedJob._id
        })
    } catch (error) {   
        console.log(error)
        res.status(500).json({message: error.message})
    }   
})

router.patch('/repost/:jobID', async (req, res) => {
    const {jobID} = req.params
    const {userID} = req.body

    const updatedFields = {
        postedAt: moment().toISOString(),
        archived: false,
    }

    try {
        let job = await Job.findById(jobID)
            .lean()

        if (job.recruiter != userID) {
            res.status(500).json({message: 'You do not have access to make edits on this job.'})
            return
        }

        job = await Job.findByIdAndUpdate(jobID, updatedFields)

        if (job) {
            res.json({message: 'Successfully reposted job.'})
        } else {
            res.status(500).json({message: 'No jobs matched those filters.'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'No jobs matched those filters.'})
    }
})

// PATCH Routes
router.patch('/:jobID', async (req, res) => {
    const {updatedFields, userID} = req.body
    const {jobID} = req.params

    const updatedJob = transformJob(updatedFields)

    try {
        const job = await Job.findById(jobID)
            .lean()

        if (job.recruiter != userID) {
            res.status(500).json({message: 'You do not have access to make edits on this job.'})
            return
        }

        await Job.findByIdAndUpdate(jobID, {
            $set: updatedJob
        })

        res.json({message: 'Successfully updated job.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router
