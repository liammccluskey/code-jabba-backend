const express = require('express')
const router = express.Router()
require('dotenv/config')
const {STRIPE_SECRET_KEY} = require('../../constants')
const stripe = require('stripe')(STRIPE_SECRET_KEY)

const User = require('../../models/User')
const Reward = require('../../models/Reward')
const Subscription = require('../../models/Subscription')
const {MAX_PAGE_SIZE, PAGE_SIZES, ENV} = require('../../constants')
const {APP_NOTIFICATIONS, EMAIL_NOTIFICATIONS} = require('./notifications')
const {
    postAppNotification,
    sendEmailNotification
} = require('../../utils/notifications')
const { transformUser, formatUser } = require('../../models/User/utils')
const {v4 : uuid} = require('uuid')
const { logEvent } = require('../events/utils')
const { EVENTS } = require('../events/constants')

// GET Routes

// get a user on login by firebase uid
router.get('/uid/:uid', async (req, res) => {
    const {uid} = req.params

    try {
        // fetch user
        const user = await User.findOne({uid})
            .lean()

        // find and update subscription
        let [subscription] = await Subscription.find({user: user._id, status: 'active'})

        if (subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionID)

            if (stripeSubscription && stripeSubscription.status !== 'active') {
                subscription = await Subscription.findByIdAndUpdate(subscription._id, {
                    status: 'deleted',
                })
            }
        }
        
        user.subscription = subscription

        res.json(formatUser(user))
    } catch (error) {
        console.log(error)
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
    - required query fields:
        - page
        - displayName
    - optional query fields:
        - pagesize
*/
router.get('/search', async (req, res) => {
    const {
        pagesize = PAGE_SIZES.userSearch,
        page,
        displayName
    } = req.query
    const pageSize = Math.min(MAX_PAGE_SIZE, pagesize)

    const filter = {
        $text: {
            $search : displayName
        }
    }

    try {
        const count = await User.countDocuments(filter)
        const users = await User.find(filter)
            .skip((page - 1)*pageSize)
            .limit(pageSize)
            .select('displayName photoURL')
            .lean()

        res.json({
            users,
            canLoadMore: users.length == pageSize,
            pagesCount: Math.ceil(count / pageSize),
            totalCount: count
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST Routes

// create a new user
// Notification Triggers
//    - general app notification
//    - general email notification
router.post('/', async (req, res) => {
    const {referralCode, isRecruiter} = req.body

    const user = ENV === 'dev' ?
        new User({
            ...req.body.user,
            isAdmin: true,
            adminKey: process.env.ADMIN_KEY,
        })
        : new User(req.body.user)
    user.referralCode = uuid()
    user.isRecruiter = isRecruiter

    try {
        await user.save()
        res.json({message: `Welcome to ${process.env.SITE_NAME}.`, userID: user._id})

        try {
            await postAppNotification(APP_NOTIFICATIONS.welcomeToSite, user._id)
        } catch (error) {
            console.log(error)
        }

        try {
            await sendEmailNotification(EMAIL_NOTIFICATIONS.welcomeToSite, user.displayName, user.email)
        } catch (error) {
            console.log(error)
        }
        
        if (referralCode) {
            try {
                const [referrer] = await User.find({referralCode})
                    .select('_id')
                    .lean()

                if (referrer) {
                    const reward = new Reward({
                        referrer: referrer._id,
                        referree: user._id
                    })

                    await reward.save()
                }
            } catch (error) {
                console.log(error)
            }
        }
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }

    if (isRecruiter) {
        await logEvent(EVENTS.recruiterSignup)

        if (referralCode) {
            await logEvent(EVENTS.recruiterReferralSignup)
        } else {
            await logEvent(EVENTS.recruiterNonReferralSignup)
        }
    } else {
        await logEvent(EVENTS.candidateSignup)

        if (referralCode) {
            await logEvent(EVENTS.candidateReferralSignup)
        } else {
            await logEvent(EVENTS.candidateNonReferralSignup)
        }
    }
})

router.post('/temporarypasswordemail', async (req, res) => {
    const {password, displayName, email} = req.body

    try {
        await sendEmailNotification(EMAIL_NOTIFICATIONS.temporaryPassword(password), displayName, email)
        res.json({message: 'Check your email for a temporary password.'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

// update a user
router.patch('/:_id', async (req, res) => {
    const {_id} = req.params
    const updatedFields = req.body
    
    try {
        const user = await User.findByIdAndUpdate(_id, {
            $set: transformUser(updatedFields)
        })
        if (user) {
            res.json({message: 'Changes saved.'})
        } else {
            throw Error('No users matched those filters.')
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Either the LinkedIn URL or the phone number you entered is already exists.'})
    }
})

router.patch('/settings/:userID', async (req, res) => {
    const {userID} = req.params
    const {path, value} = req.body

    const fieldPath = 'settings.' + path

    try {
        const user = await User.findByIdAndUpdate(userID, {
            $set: {
                [fieldPath]: value,
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

    let didDeleteUser = false
    let user
    try {
        user = await User.findOneAndDelete(filter)

        if (user) {
            res.json({message: 'User deleted.'})
            didDeleteUser = true
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }

    if (didDeleteUser) {
        if (user.isRecruiter) {
            await logEvent(EVENTS.recruiterDeleteAccount)
        } else {
            await logEvent(EVENTS.candidateDeleteAccount)
        }
    }
})

module.exports = router