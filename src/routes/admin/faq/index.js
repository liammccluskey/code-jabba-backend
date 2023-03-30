const express = require('express')
const router = express.Router()

const FAQ = require('../../../models/FAQ')

const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../../constants')

// GET Routes

//  optional query fields
//      - pagesize
//  required query fields
//      - page
//      - section
//      - sortby : -createdAt | +createdAt
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.faqs,
        page,
        sortby,
        sections=[],
        title=''
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        ...(title ?
            {
                $text: {
                    $search: title
                }
            }
            : {}
        ),
        ...(sections.length ?
            {
                section: {
                    $in: sections.split('-')
                }
            } : {}
        )
    }

    try {
        const count = await FAQ.countDocuments(filter)
        const faqs = await FAQ.find(filter)
            .sort(sortby)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()

        res.json({
            faqs,
            canLoadMore: faqs.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/:faqID', async (req, res) => {
    const {faqID} = req.params

    try {
        const faq = await FAQ.findById(faqID)
            .lean()

        if (faq) {
            res.json(faq)
        } else {
            throw Error('No FAQs matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    const faq = new FAQ(req.body)

    try {
        await faq.save()

        res.json({message: 'FAQ created.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('', async (req, res) => {
    const {faqIDs, updatedFields} = req.body

    const filter = {
        _id: {
            $in: faqIDs
        }
    }

    try {
        await FAQ.updateMany(filter, updatedFields)

        res.json({
            message: faqIDs.length > 1 ?
                'Successfully updated FAQs.'
                : 'Successfully updated FAQ.'
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/', async (req, res) => {
    let {faqIDs} = req.query
    faqIDs = faqIDs.split('-')

    const filter = {
        _id: {
            $in: faqIDs
        }
    }

    try {
        await FAQ.deleteMany(filter)

        res.json({
            message: faqIDs.length > 1 ?
                'Successfully deleted FAQs.'
                : 'Successfully deleted FAQ.'
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router