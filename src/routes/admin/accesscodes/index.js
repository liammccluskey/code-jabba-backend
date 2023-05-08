const express = require('express')
const router = express.Router()

const AccessCode = require('../../../models/AccessCode')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../../constants')
const {v4: uuid} = require('uuid')

// GET Routes

//  get paginated access codes
//  required query fields
//      - page
//      - sortby
//  optional query fields
//      - title
//      - claimed
//      - pagesize
router.get('/search', async (req, res) => {
    const {
        page,
        sortby,
        title,
        claimed,
        pagesize = PAGE_SIZES.accessCodes
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)
    const filter = {
        ...(!!title ? {
            $text: {
                $search: title
            }
        } : {}),
        ...(claimed === undefined ? {} : {claimed}),
    }

    try {
        const count = await AccessCode.countDocuments(filter)
        const accessCodes = await AccessCode.find(filter)
            .sort(sortby)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()

        res.json({
            accessCodes,
            canLoadMore: accessCodes.length == pageSize,
            pagesCount: Math.ceil(count/ pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/:accessCodeID', async (req, res) => {
    const {accessCodeID} = req.params

    try {
        const accessCode = await AccessCode.findById(accessCodeID)
            .lean()

        if (accessCode) {
            res.json(accessCode)
        } else {
            throw Error('No access codes matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    const {title} = req.body
    const accessCode = new AccessCode({
        title,
        code: uuid()
    })

    try {
        await accessCode.save()

        res.json({
            message: 'Access code created.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router