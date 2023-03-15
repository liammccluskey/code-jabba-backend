const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const moment = require('moment')
require('dotenv/config')

// PATH: /users

// TEST
router.get('/test/:testID', async (req, res) => {
    const {testID} = req.params || 'null'
    console.log({testID})
    res.json({message: 'test'})
})

// GET: a user on login by firebase uid
router.get('/uid/:uid', async (req, res) => {
    const {uid} = req.params

    try {
        const user = await User.findOne({uid})
            .lean()

        res.json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// GET: a user by _id
router.get('/_id/:_id', async (req, res) => {
    const {_id} = req.params

    try {
        const user = await User.findById(_id)
            .lean()

        res.json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// GET: search for a user
/*
    supported fields: displayName
    required fields: page, pagesize
*/
router.get('/search', async (req, res) => {
    const {pagesize, page, displayName} = req.query
    const pageSize = Math.min(50, pagesize)

    const query = {
        $text: {
            $search : displayName
        }
    }

    try {
        const count = await User.countDocuments(query)
        const users = await User.find(query)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('displayName photoURL')
            .lean()

        res.json({
            users: users,
            count: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH: update a user
router.patch('/:_id', async (req, res) => {
    const {_id} = req.params
    
    try {
        await User.findByIdAndUpdate(_id, {
            $set: req.body
        })
        res.json({message: 'Changes saved.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST: create a new user
router.post('/', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.json({message: `Welcome to ${process.env.SITE_NAME}`})
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// DELETE: delete a user
router.delete('/', async (req, res) => {
    const {uid, _id} = req.params

    try {
        await User.findOneAndDelete({uid, _id})
        res.json({message: 'User deleted.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router