const express = require('express')
const router = express.Router()

const FAQ = require('../../models/FAQ')

// GET Routes

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

// get all faq
router.get('/', async (req, res) => {
    try {
        const faqs = await FAQ.find()
            .lean()

        const faqsBySection = {}

        faqs.forEach( faq => {
            const {section} = faq

            if (section in faqsBySection) {
                faqsBySection[section].push(faq)
            } else {
                faqsBySection[section] = [faq]
            }
        })

        res.json(faqsBySection)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router