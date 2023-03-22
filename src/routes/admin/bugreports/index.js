const express = require('express')
const router = express.Router()

const BugReport = require('../../../models/BugReport')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../constants')

// GET Routes

//  Get paginated bug reports
//  optional query fields
//      - pagesize
//      - title
//  required query fields
//      - page
//      - resolved
//      - highPriority
//      - archived
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.bugReportsSearch,
        page,
        resolved,
        highPriority,
        archived
    } = req.query

    const pageSize = Math.max(MAX_PAGE_SIZE, pagesize)
    const filter = {
        resolved,
        highPriority,
        archived
    }

    try {
        const bugReports = await BugReport.find(filter)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()

        res.json(bugReports)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/:bugReportID', async (req, res) => {
    const bugReportID = req.params
    const updatedFields = req.body

    const filter = {_id: bugReportID}

    try {
        const updatedBugReport = await BugReport.updateOne(filter, {
            $set: updatedFields
        })

        if (updatedBugReport) {
            res.json({message: 'Successfully updated bug report.'})
        } else {
            throw Error('No bug reports matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/:bugReportID', async (req, res) => {
    const {bugReportID} = req.params

    try {
        const deletedBugReport = await BugReport.findByIdAndDelete(bugReportID)

        if (deletedBugReport) {
            res.json({message: 'Successfully deleted bug report.'})
        } else {
            throw Error('No bug reports matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router