const express = require('express')
const router = express.Router()
const moment = require('moment')

const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../constants')
const Application = require('../../models/Application')
const Job = require('../../models/Job')
const {percentDelta} = require('../../utils/misc')
const {logEvent} = require('../events/utils')
const {HiddenUserKeysSelectStatement} = require('../../models/User/constants')
const {NOTIFICATIONS} = require('./notifications')
const {sendNotificationIfEnabled} = require('../../utils/notifications')

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

router.get('/recruiter-search', async (req, res) => {
    const {
        userID,
        jobID,
        sortBy,
        page,
        pagesize=PAGE_SIZES.recruiterApplicationSearch,
        status=undefined,
        candidateName='',
    } = req.query
    pageSize = Math.min(PAGE_SIZES.recruiterApplicationSearch, pagesize)

    const filter = {
        ...(status === undefined ? {} : {status}),
        ...(candidateName === '' ? {} : {$text: {$search: candidateName}}),
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
            pagesCount: Math.ceil(count / pageSize)
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/value-delta-stats', async (req, res) => {
    const {
        timeframe,  // week | month | year
        userID, 
        userType, 
        jobID = undefined
    } = req.query
    const isRecruiterMode = userType === 'recruiter'

    let timeframeStart, previousTimeframeStart
    const timeframeEnd = moment().endOf('day').toDate()

    timeframeStart = moment().subtract(1, timeframe).startOf('day').toDate()
    previousTimeframeStart = moment().subtract(2, timeframe + 's').startOf('day').toDate()

    const [submittedFilter, viewedFilter, rejectedFilter, acceptedFilter] = ['createdAt', 'viewedAt', 'rejectedAt', 'acceptedAt'].map( field => ({
        [field]: {$gte: timeframeStart, $lte: timeframeEnd},
        ...(isRecruiterMode ? {recruiter: userID} : {candidate: userID}),
        ...(jobID === undefined ? {} : {job: jobID})
    }))
    const [previousSubmittedFilter, previousViewedFilter, previousRejectedFilter, previousAcceptedFilter] = ['createdAt', 'viewedAt', 'rejectedAt', 'acceptedAt'].map( field => ({
        [field]: {$gte: previousTimeframeStart, $lte: timeframeStart},
        ...(isRecruiterMode ? {recruiter: userID} : {candidate: userID}),
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

router.get('/heatmap', async (req, res) => {
    const {
        userType,  // recruiter | candidate
        userID
    } = req.query

    try {
        const startOfYear = moment().startOf('year')
        const endOfYear = moment().endOf('year')

        const applications = await Application.find({
            ...(userType === 'recruiter' ?
                {recruiter: userID}
                : {candidate: userID} 
            ),
            createdAt: {
                $gte: startOfYear.toDate(),
                $lte: endOfYear.toDate()
            }
        })
        .select('createdAt')
        .lean()

        const data = {
            count: applications.length,
            max: 0,
            data: {}
        }

        applications.forEach(application => {
            const dayOfYear = moment(application.createdAt).dayOfYear()

            if (dayOfYear in data.data) {
                data.data[dayOfYear]++
            } else {
                data.data[dayOfYear] = 1
            }
        })

        res.json(data)
    } catch (error ) {
        res.status(500).json({message: 'An error occured searching for applications heatmap data'})
    }
})

router.get('/:applicationID', async (req, res) => {
    const { applicationID } = req.params
    const { userID } = req.query

    try {
        const application = await Application.findById(applicationID)
            .populate({
                path: 'job',
                populate: [
                    {path: 'company', select: 'name'},
                    {path: 'recruiter', select: 'displayName'}
                ]
            })
            .populate('candidate', HiddenUserKeysSelectStatement)
            .lean()

        if (application) {
            const userIsApplicationCandidate = String(application.candidate._id) === userID 
            const userIsApplicationRecruiter = String(application.recruiter) === userID
            if (userIsApplicationCandidate && !userIsApplicationRecruiter) {
                application.job.applied = true
                res.json(application)

                return
            } else if (userIsApplicationRecruiter) {
                let updatedStatusToViewed = false
                const updatedStatusTimestamp = moment().toISOString()
                if (application.status === 'applied') {
                    application.status = 'viewed'
                    application.viewedAt = updatedStatusTimestamp

                    updatedStatusToViewed = true
                }
                res.json(application)

                if (updatedStatusToViewed) {
                    await Application.findOneAndUpdate({_id: applicationID}, {
                        $set: {status: 'viewed', viewedAt: updatedStatusTimestamp}
                    })
                }
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

router.patch('/:applicationID', async (req, res) => {
    const {applicationID} = req.params
    const {status, userID} = req.body

    try {
        const application = await Application.findById(applicationID)
            .select('recruiter candidate status')
            .lean()

        if (!application) {
            res.status(404).json({message: 'Could not find any applications matching those filters.'})
            return
        } else if (
            !(String(application.recruiter) === userID) && 
            !(String(application.candidate) === userID)
        ) {
            res.status(403).json({message: 'You do not have permission to update the status of this application.'})
            return
        } else if (application.status === status) {
            return
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'An error occurred updating this application status.'})
        return
    }

    const filter = {_id: applicationID}

    try {
        const updatedApplication = await Application
            .findOneAndUpdate(
                filter, 
                {
                    $set: {
                        status: status,
                        [`${status}At`]: moment().toISOString()
                    }
                },
                {new: true}
            )
            .populate({
                path: 'job',
                populate: [
                    {path: 'company', select: 'name'},
                    {path: 'recruiter', select: 'displayName'}
                ]
            })
            .populate('candidate', 'displayName')
            .populate('recruiter', 'displayName')
            .lean()

        if (updatedApplication) {
            res.status(200).json({message: 'Successfully updated application status.'})

            const notification = status === 'accepted' ? 
                NOTIFICATIONS.applicationAccepted(updatedApplication)
                : NOTIFICATIONS.applicationRejected(updatedApplication)

            try {
                sendNotificationIfEnabled(notification, updatedApplication.candidate, true, true)
            } catch (error) {
                console.log(error)
            }
        } else {
            res.status(404).json({message: 'No applications matched those filters.'})
        }
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