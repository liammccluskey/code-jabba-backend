const express = require('express')
const router = express.Router()

const BugReport = require('../../models/BugReport')

// POST Routes

router.post('/', async (req, res) => {
    const bugReport = new BugReport(req.body)

    try {
        await bugReport.save()
        
        res.json({message: 'Bug report created.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router