const express = require('express')
const router = express.Router()
const moment = require('moment')

const BugReport = require('../../../models/BugReport')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../../constants')
const {percentDelta} = require('../../../utils/misc')

// GET Routes

//  Get paginated bug reports
//  optional query fields
//      - pagesize
//      - title
//      - resolved
//      - highPriority
//      - archived
//  required query fields
//      - page
//      - sortby
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.bugReports,
        page,
        sortby,
        resolved=undefined,
        highPriority=undefined,
        archived=undefined,
        title
    } = req.query

    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)
    const filter = {
        ...(resolved === undefined ? {} : {resolved}),
        ...(highPriority ? {highPriority: true} : {}),
        ...(archived ? {archived: true} : {}),
        ...(!!title ? {title} : {})
    }

    try {
        const count = await BugReport.countDocuments(filter)
        const bugReports = await BugReport.find(filter)
            .populate('reporter', 'displayName photoURL')
            .sort(sortby)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()

        res.json({
            bugReports,
            canLoadMore: bugReports.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//  required query fields
//      - timeframe : 'week' | 'month' | 'year'
router.get('/stats', async (req, res) => {
    const {timeframe} = req.query

    let timeframeStart, previousTimeframeStart
    const timeframeEnd = moment().endOf('day').toDate()

    timeframeStart = moment().subtract(1, timeframe).startOf('day').toDate()
    previousTimeframeStart = moment().subtract(2, timeframe + 's').startOf('day').toDate()

    const [reportsFilter, resolvedFilter, archivedFilter] = ['createdAt', 'resolvedAt', 'archivedAt'].map( field => ({
        [field]: {$gte: timeframeStart, $lte: timeframeEnd}
    }))
    const [previousReportsFilter, previousResolvedFilter, previousArchivedFilter] = ['createdAt', 'resolvedAt', 'archivedAt'].map( field => ({
        [field]: {$gte: previousTimeframeStart, $lte: timeframeStart}
    }))

    try {
        const reportsCount = await BugReport.countDocuments(reportsFilter)
        const resolvedCount = await BugReport.countDocuments(resolvedFilter)
        const archivedCount = await BugReport.countDocuments(archivedFilter)
        const previousReportsCount = await BugReport.countDocuments(previousReportsFilter)
        const previousResolvedCount = await BugReport.countDocuments(previousResolvedFilter)
        const previousArchivedCount = await BugReport.countDocuments(previousArchivedFilter)

        const reportsPercentDelta = percentDelta(previousReportsCount, reportsCount)
        const resolvedPercentDelta = percentDelta(previousResolvedCount, resolvedCount)
        const archivedPercentDelta = percentDelta(previousArchivedCount, archivedCount)

        res.json({
            reportsCount,
            resolvedCount,
            archivedCount,
            reportsPercentDelta,
            resolvedPercentDelta,
            archivedPercentDelta
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Could not fetch bug report statistics.'})
    }
})

router.get('/:bugReportID', async (req, res) => {
    const {bugReportID} = req.params

    try {
        const bugReport = await BugReport.findById(bugReportID)
            .populate('reporter', 'displayName photoURL')
            .lean()

        if (bugReport) {
            res.json(bugReport)
        } else {
            throw Error('No bug reports matched those filters.')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/', async (req, res) => {
    const {bugReportIDs, updatedFields} = req.body

    if (updatedFields.resolved) {
        updatedFields['resolvedAt'] = moment().toISOString()
    } else if (updatedFields.resolve == false) {
        updatedFields['resolvedAt'] = null
    }
    if (updatedFields.archived) {
        updatedFields['archivedAt'] = moment().toISOString()
    } else if (updatedFields.archived == false) {
        updatedFields['archivedAt'] = null
    }

    const filter = {
        _id: {
            $in: bugReportIDs
        }
    }

    try {
        await BugReport.updateMany(filter, {
            $set: updatedFields
        })

        res.json({
            message: bugReportIDs.length > 1 ? 
                'Successfully updated bug reports.'
                : 'Successfully updated bug report.'
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/', async (req, res) => {
    let {bugReportIDs} = req.query
    bugReportIDs = bugReportIDs.split('-')

    const filter = {
        _id: {
            $in: bugReportIDs
        }
    }

    try {
        await BugReport.deleteMany(filter)

        res.json({message: bugReportIDs.length > 1 ?
            'Successfully deleted bug reports.'
            : 'Successfully deleted bug report.'
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router