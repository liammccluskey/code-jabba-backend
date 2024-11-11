const express = require('express')
const router = express.Router()
require('dotenv/config')

const User = require('../../../models/User')
const Subscription = require('../../../models/Subscription')
const {MAX_PAGE_SIZE, PAGE_SIZES} = require('../../../constants')
const {hasSuperAdminPrivileges} = require('../utils')
const { SUBSCRIPTION_TIERS } = require('../../../models/Subscription/constants')

// GET Routes

// GET all admin and super admin users
router.get('/', async (req, res) => {
    const filter = {
        $or: [
            {isAdmin: true},
            {isSuperAdmin: true}
        ]
    }

    try {
        const users = await User.find(filter)
            .lean()
            .select('displayName photoURL isAdmin isSuperAdmin adminKey superAdminKey')

        res.json(users)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// GET all non-admin users
//  - required query fields
//      - searchText 
router.get('/searchnonadmin', async (req, res) => {
    const {searchText} = req.query
    const filter = {
        $text: {
            $search: searchText
        },
        isAdmin: false,
        isSuperAdmin: false
    }

    try {
        const users = await User.find(filter)
            .limit(MAX_PAGE_SIZE)
            .lean()
            .select('displayName email photoURL')

        res.json(users)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/user-stats', async (req, res) => {
    try {
        const candidatesCount = await User.countDocuments({isRecruiter: false})
        const recruitersCount = await User.countDocuments({isRecruiter: true})
        const premiumCandidatesCount = await Subscription.countDocuments({status: 'active', tier: SUBSCRIPTION_TIERS.candidatePremium})
        const premiumRecruitersCount = await Subscription.countDocuments({status: 'active', tier: SUBSCRIPTION_TIERS.recruiterPremium})

        res.json({
            candidatesCount,
            recruitersCount,
            premiumCandidatesCount,
            premiumRecruitersCount
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// PATCH Routes

// PATCH make user admin
router.patch('/makeadmin', async (req, res) => {
    const {userID} = req.body
    const filter = {_id: userID}

    try {
        const user = await User.findOneAndUpdate(filter, {
            isAdmin: true,
            adminKey: process.env.ADMIN_KEY
        })

        if (user) {
            res.json({message: `Successfully made user ${user.displayName} an admin.`})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH make user admin
router.patch('/removeadmin', async (req, res) => {
    if (!hasSuperAdminPrivileges(req)) {
        res.status(500).json({message: 'This operation requires super admin privileges to complete.'})
        return
    }
    const {userID} = req.body
    const filter = {_id: userID}

    try {
        const user = await User.findOneAndUpdate(filter, {
            isAdmin: false,
            adminKey: undefined,
            isSuperAdmin: false,
            superAdminKey: undefined
        })

        if (user) {
            res.json({message: `Successfully removed admin user ${user.displayName}.`})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH make user super admin
router.patch('/makesuperadmin', async (req, res) => {
    if (!hasSuperAdminPrivileges(req)) {
        res.status(500).json({message: 'This operation requires super admin privileges to complete.'})
        return
    }

    const {userID} = req.body
    const filter = {_id: userID}

    try {
        const user = await User.findOneAndUpdate(filter, {
            isAdmin: true,
            adminKey: process.env.ADMIN_KEY,
            isSuperAdmin: true,
            superAdminKey: process.env.SUPER_ADMIN_KEY,
        })

        if (user) {
            res.json({message: `Successfully made user ${user.displayName} a super admin.`})
        } else {
            throw Error('No users matched those filters.')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router