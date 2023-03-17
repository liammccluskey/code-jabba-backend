const express = require('express')
const router = express.Router()
const moment = require('moment')
require('dotenv/config')

const User = require('../../models/User')
const Notification = require('../../models/Notification')
const DataConstants = require('../../constants/data')
const NOTIFICATIONS = require('../../constants/notifications')


// GET Routes

// get a user on login by firebase uid
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

// get a user by _id
router.get('/_id/:_id', async (req, res) => {
    const {_id} = req.params

    try {
        const user = await User.findById(_id)
            .lean()
        if (user) {
            res.json(user)
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// search for a user
/*
    supported fields: displayName
    required fields: page, pagesize
*/
router.get('/search', async (req, res) => {
    const {
        pagesize = DataConstants.PAGE_SIZES.userSearch,
        page,
        displayName
    } = req.query
    const pageSize = Math.min(DataConstants.MAX_PAGE_SIZE, pagesize)

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
            data: users,
            canLoadMore: users.count == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

// create a new user
router.post('/', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.json({message: `Welcome to ${process.env.SITE_NAME}`})

        try {
            const notification = Notification({
                ...NOTIFICATIONS.welcomeToSite,
                user: user._id
            })
            await notification.save()
        } catch (error) {
            console.log(error)
        }
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

// update a user
router.patch('/:_id', async (req, res) => {
    const {_id} = req.params
    
    try {
        const user = await User.findByIdAndUpdate(_id, {
            $set: req.body
        })
        if (user) {
            res.json({message: 'Changes saved.'})
        } else {
            throw Error('No users matched those filters.')
        }

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.patch('/settings/:userID', async (req, res) => {
    const {userID} = req.params
    const {path, value} = req.body

    const fieldPath = 'settings.' + path

    try {
        const user = User.findByIdAndUpdate(userID,{
            $set: {
                [fieldPath]: value
            }
        })

        if (user) {
            res.json({message: 'Changes saved.'})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

// delete a user
router.delete('/', async (req, res) => {
    const {uid, userID} = req.query
    const filter = {
        uid,
        _id: userID
    }

    try {
        const user = User.findOneAndDelete(filter)
        if (user) {
            res.json({message: 'User deleted.'})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router