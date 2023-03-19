const express = require('express')
const router = express.Router()

const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../constants')

// GET Routes

router.get('/', async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    try {

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