const express = require('express')
const router = express.Router()
const Notification = require('../../models/Notification')
const DataConstants = require('../../constants/data')

// GET Routes

// get a user's notifications
/*
    required fields: page, pagesize
*/
router.get('/user/:userID', async (req, res) => {
    const {userID} = req.params
    const {
        page,
        pagesize = DataConstants.PAGE_SIZES.notifications
    } = req.query
    const pageSize = Math.min(pagesize, DataConstants.MAX_PAGE_SIZE)
    const filter = {user: userID}

    try {
        const count = await Notification.countDocuments(filter)
        const notifcations = await Notification.find(filter)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()
        
        res.json({
            notifications,
            canLoadMore: !(notifications.count == pageSize),
            pagesCount: Math.ceil(count / pageSize)
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/', async (req, res) => {
    const notification = new Notification(req.body)

    try {
        await notification.save()
        res.json({message: 'Notification added.'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

router.patch('/markasread/:notificationID', async (req, res) => {
    const {notificationID} = req.params
    const filter = {_id: notificationID}

    try {
        const notification = await Notification.findOneAndUpdate(filter, {
            $set: {
                isRead: true
            }
        })
        if (notification) {
            res.json({message: 'Marked notification as read.'})
        } else {
            throw Error('No notifications matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE Routes

router.delete('/', async (req, res) => {
    const {notificationID, userID} = req.query
    const filter = {
        _id: notificationID,
        user: userID
    }

    try {
        const notification = await Notification.findOneAndDelete(filter)
        if (notification) {
            res.json({message: 'Notification deleted.'})
        } else {
            throw Error('No notifications matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})