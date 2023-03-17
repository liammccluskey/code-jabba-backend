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
        const notifications = await Notification.find(filter)
            .sort({createdAt: 1})
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .lean()
        
        res.json({
            data: notifications,
            canLoadMore: notifications.count == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
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

router.patch('/markasread', async (req, res) => {
    const {notificationIDs} = req.body
    const filter = {
        _id: {
            $in: notificationIDs
        }
    }

    try {
        await Notification.updateMany(filter, {
            $set: {
                isRead: true
            }
        })
        res.json({message: 'Marked notifications as read.'})
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

module.exports = router