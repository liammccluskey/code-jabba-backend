const express = require('express')
const router = express.Router()
require('dotenv/config')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const {SUBSCRIPTION_TIERS} = require('../../models/User/constants')
const {SUBSCRIPTION_PRICE_IDS} = require('./constants')
const User = require('../../models/User')

// PATCH Routes

router.patch('/cancel-subscription', async (req, res) => {
    const {userID, stripeID} = req.body
    try {
        const customer = await stripe.customers.retrieve(stripeID)

        if (customer) {
            const subscriptions = await stripe.subscriptions.list()
            const subscription = subscriptions.data.find(sub => sub.customer === customer.id)

            if (subscription) {
                await stripe.subscriptions.del(subscription.id)
                await stripe.customers.del(customer.id)

                const user = await User.findByIdAndUpdate(userID, {
                    subscriptionTier: null
                })

                res.json({message: 'Successfully cancelled your subscription.'})
            } else {
                throw Error('You do not have any active subscriptions.')
            }
        } else {
            throw Error('You do not have any active subscriptions.')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

router.patch('/update-subscription', async (req, res) => {
    const {userID, userEmail, subscriptionTier} = req.body
    try {
        const customers = await stripe.customers.search({
            query: `email:\'${userEmail}\'`,
        })
        const [customer] = customers.data

        if (customer && customer.subscriptions) {
            const [subscription] = customer.subscriptions.data

            if (subscription && subscription.status === 'active') {
                const user = await User.findByIdAndUpdate(userID, {
                    subscriptionTier,
                    stripeID: customer.id
                })
    
                res.json({message: 'Successfully updated your subscription.'})
            } else {
                throw Error('We have no record of payment for your subscription.')
            }
        } else {
            throw Error('We have no record of payment for your subscription.')
        }

        // if (customer) {
        //     const subscriptions = await stripe.subscriptions.list()
        //     const subscription = subscriptions.data.find(sub => sub.customer === customer.id)

        //     if (subscription) {
        //         const user = await User.findByIdAndUpdate(userID, {
        //             subscriptionTier,
        //             stripeID: customer.id
        //         })
    
        //         res.json({message: 'Successfully updated your subscription.'})
        //     } else {
        //         throw Error('We have no record of payment for your subscription.')
        //     }
        // } else {
        //     throw Error('We have no record of payment for your subscription.')
        // }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price: SUBSCRIPTION_PRICE_IDS.premium,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `http://${process.env.DOMAIN_NAME}/membership/checkoutsuccess`,
            cancel_url: `http://${process.env.DOMAIN_NAME}/membership/checkoutcancel`,
          })
        
          res.json({sessionURL: session.url})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router