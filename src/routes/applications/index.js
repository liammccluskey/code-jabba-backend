const express = require('express')
const router = express.Router()
const moment = require('moment')

const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../constants')
const Application = require('../../models/Application')
const {percentDelta} = require('../../utils/misc')

// GET Routes

/*
    - required query fields:
        - page
        - userID
        - sortBy
    - optional query fields:
        - pagesize
        - status
        - archived
*/
router.get('/candidate-search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.candidateApplicationSearch,
        page,
        userID,
        sortBy,
        status=undefined,
        archived=undefined,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        ...(archived ? {archived} : {}),
        ...(status === undefined ? {} : {status}),
        candidate: userID
    }

    try {
        const count = await Application.countDocuments(filter)
        const applications = await Application.find(filter)
            .sort(sortBy)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('status createdAt archived')
            .populate('job', 'title')
            .populate({
                path: 'job',
                select: 'title',
                populate: {
                    path: 'company',
                    select: 'name'
                }
            })
            .lean()

        res.json({
            applications,
            pagesCount: Math.ceil(count / pageSize),
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

/*
    - required query fields:
        - page
        - userID
        - jobID
        - sortBy
    - optional query fields:
        - pagesize
        - status
*/
router.get('/recruiter-search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.recruiterApplicationSearch,
        page,
        userID,
        jobID,
        sortBy,
        status=undefined,
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        ...(status === undefined ? {} : {status}),
        recruiter: userID,
        job: jobID,
    }

    try {
        const count = await Application.countDocuments(filter)
        const applications = await Application.find(filter)
            .sort(sortBy)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('status createdAt')
            .populate('candidate', 'displayName email')
            .lean()

        res.json({
            applications,
            pagesCount: Math.ceil(count / pageSize),
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

//  required query fields
//      - timeframe : week | month | year
//      - userID
//      - isRecruiter
// optional query fields
//      - jobID
router.get('/stats', async (req, res) => {
    const {timeframe, userID, jobID} = req.query
    const isRecruiter = Number(req.query.isRecruiter)

    let timeframeStart, previousTimeframeStart
    const timeframeEnd = moment().endOf('day').toDate()

    timeframeStart = moment().subtract(1, timeframe).startOf('day').toDate()
    previousTimeframeStart = moment().subtract(2, timeframe + 's').startOf('day').toDate()

    const [submittedFilter, viewedFilter, rejectedFilter, acceptedFilter] = ['createdAt', 'viewedAt', 'rejectedAt', 'acceptedAt'].map( field => ({
        [field]: {$gte: timeframeStart, $lte: timeframeEnd},
        ...(isRecruiter ? {recruiter: userID} : {candidate: userID}),
        ...(jobID === undefined ? {} : {job: jobID})
    }))
    const [previousSubmittedFilter, previousViewedFilter, previousRejectedFilter, previousAcceptedFilter] = ['createdAt', 'viewedAt', 'rejectedAt', 'acceptedAt'].map( field => ({
        [field]: {$gte: previousTimeframeStart, $lte: timeframeStart},
        ...(isRecruiter ? {recruiter: userID} : {candidate: userID}),
        ...(jobID === undefined ? {} : {job: jobID})
    }))

    try {
        const submittedCount = await Application.countDocuments(submittedFilter)
        const viewedCount = await Application.countDocuments(viewedFilter)
        const rejectedCount = await Application.countDocuments(rejectedFilter)
        const acceptedCount = await Application.countDocuments(acceptedFilter)
        const previousSubmittedCount = await Application.countDocuments(previousSubmittedFilter)
        const previousViewedCount = await Application.countDocuments(previousViewedFilter)
        const previousRejectedCount = await Application.countDocuments(previousRejectedFilter)
        const previousAcceptedCount = await Application.countDocuments(previousAcceptedFilter)

        const submittedPercentDelta = percentDelta(previousSubmittedCount, submittedCount)
        const viewedPercentDelta = percentDelta(previousViewedCount, viewedCount)
        const rejectedPercentDelta = percentDelta(previousRejectedCount, rejectedCount)
        const acceptedPercentDelta = percentDelta(previousAcceptedCount, acceptedCount)

        res.json({
            submittedCount,
            viewedCount,
            rejectedCount,
            acceptedCount,
            submittedPercentDelta,
            viewedPercentDelta,
            rejectedPercentDelta,
            acceptedPercentDelta
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Could not fetch application statistics.'})
    }
})

router.get('/:applicationID', async (req, res) => {
    const {applicationID} = req.params
    const {userID} = req.query

    try {
        const application = await Application.findById(applicationID)
            .populate({
                path: 'job',
                populate: {
                    path: 'company'
                }
            })
            .lean()

        if (application) {
            application.job.applied = true
            if (application.candidate == userID) {
                res.json(application)
            } else {
                res.status(500).json({message: 'You do not have access to this application.'})
            }
        } else {
            res.status(500).json({message: 'No applications matched those filters'})
        }
    } catch (error) {
        res.status(500).json({message: 'No applications matched those filters'})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    const application = new Application(req.body)

    try {
        await application.save()

        res.json({message: 'Successfully submitted application.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/', async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/', async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router