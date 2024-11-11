const express = require('express')
const router = express.Router()

const {SUBSCRIPTION_TIERS, SUBSCRIPTION_PRICE_IDS} = require('../../models/Subscription/constants')
const User = require('../../models/User')
const Reward = require('../../models/Reward')
const Subscription = require('../../models/Subscription')
const { STRIPE_SECRET_KEY, DOMAIN } = require('../../constants')
const { logEvent } = require('../events/utils')
const { EVENTS } = require('../events/constants')

const stripe = require('stripe')(STRIPE_SECRET_KEY)

// PATCH Routes

router.patch('/cancel-subscription', async (req, res) => {
    const {userID} = req.body

    let cancelledSubscription = false
    try {
        const [subscription] = await Subscription.find({user: userID})
        
            if (subscription) {
                const {tier} = await Subscription.findByIdAndUpdate(subscription._id, {
                    status: 'cancelled',
                })
                await stripe.subscriptions.del(subscription.stripeSubscriptionID)
                await stripe.customers.del(subscription.stripeCustomerID)

                cancelledSubscription = true

                res.json({message: 'Successfully cancelled your subscription.'})
            } else {
                throw new Error('You have no active subscriptions.')
            }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }

    if (cancelledSubscription) {
        if (tier === SUBSCRIPTION_TIERS.candidatePremium) {
            await logEvent(EVENTS.candidateCancelledPremium)
        } else {
            await logEvent(EVENTS.recruiterCancelledPremium)
        }
    }
})

router.patch('/update-subscription', async (req, res) => {
    const {userID, userEmail, subscriptionTier} = req.body

    let signedUpForPremium = false
    try {
        const customers = await stripe.customers.search({
            query: `email:\'${userEmail}\'`,
        })
        const [customer] = customers.data

        if (customer) {
            const subscriptions = await stripe.subscriptions.list()
            const subscription = subscriptions.data.find(sub => sub.customer === customer.id) 

            if (subscription) {
                const sub = new Subscription({
                    user: userID,
                    tier: subscriptionTier,
                    stripeCustomerID: customer.id,
                    stripeSubscriptionID: subscription.id
                })

                await sub.save()

                signedUpForPremium = true
    
                res.json({message: 'Successfully updated your subscription.'})
            } else {
                throw Error('We have no record of payment for your subscription.')
            }
        } else {
            throw Error('We have no record of payment for your subscription.')
        }
        
        const rewards = await Reward.find({user: userID})
        const signedUpByReferral = rewards.length > 0

        if (signedUpForPremium) {
            await Reward.findOneAndUpdate({referree: userID, active: false}, {active: true})

            if (subscriptionTier === SUBSCRIPTION_TIERS.candidatePremium) {
                await logEvent(EVENTS.candidatePremiumSignup)

                if (signedUpByReferral) {
                    await logEvent(EVENTS.candidateReferralPremiumSignup)
                } else {
                    await logEvent(EVENTS.candidateNonReferralPremiumSignup)
                }
            } else {
                await logEvent(EVENTS.recruiterPremiumSignup)

                if (signedUpByReferral) {
                    await logEvent(EVENTS.recruiterReferralPremiumSignup)
                } else {
                    await logEvent(EVENTS.recruiterNonReferralPremiumSignup)
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/create-checkout-session', async (req, res) => {
    const {subscriptionTier} = req.body

    const subscriptionPriceID = SUBSCRIPTION_PRICE_IDS[subscriptionTier]

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price: subscriptionPriceID,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${DOMAIN}/membership/checkoutsuccess/${subscriptionTier}`,
            cancel_url: `${DOMAIN}/membership/checkoutcancel`,
          })
        
          res.json({sessionURL: session.url})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router