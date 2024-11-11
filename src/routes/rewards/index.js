const express = require('express')
const router = express.Router()

const Reward = require('../../models/Reward')
const { sendEmail } = require('../../utils/notifications')
const { PAGE_SIZES } = require('../../constants')


// GET Routes

// optional query params
//  - unclaimed
//  - active
router.get('/search', async (req, res) => {
    const {
        page,
        userID,
        unclaimed=undefined,
        active=undefined,
    } = req.query

    const filter = {
        referrer: userID, 
        ...(unclaimed ? {claimed: false} : {}),
        ...(active ? {active: true} : {}),
    }

    try {
        const count = await Reward.countDocuments(filter)
        const rewards = await Reward.find(filter)
            .sort('-createdAt')
            .populate('referree', 'displayName')
            .lean()

        res.json({
            rewards,
            pagesCount: Math.ceil(count / PAGE_SIZES.rewardsSearch),
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.get('/stats', async (req, res) => {
    const {userID} = req.query

    try {
        const referralsCount = await Reward.countDocuments({referrer: userID})
        const claimedReferralsCount = await Reward.countDocuments({referrer: userID, claimed: true})
        const unclaimedReferralsCount = await Reward.countDocuments({referrer: userID, claimed: false, active: true})

        res.json({
            referralsCount,
            claimedReferralsCount,
            unclaimedReferralsCount
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/send-referral-email', async (req, res) => {
    const {email, message} = req.body

    try {
        const didSendEmail = await sendEmail(email, 'Sign up for Code Jabba', message)

        if (didSendEmail) {
            res.json({message: 'Successfully sent referral email.'})
        } else {
            res.status(500).json({message: `Failed to send email to ${email}`})
        }
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