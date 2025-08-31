const express = require('express')
const router = express.Router()

const {SUBSCRIPTION_TIERS, SUBSCRIPTION_PRICE_IDS} = require('../../models/Subscription/constants')
const Subscription = require('../../models/Subscription')
const { STRIPE_SECRET_KEY, CODE_JABBA_DOMAIN } = require('../../constants')
const {sendNotificationIfEnabled} = require('../../utils/notifications')
const {NOTIFICATIONS}  = require('./notifications')

const stripe = require('stripe')(STRIPE_SECRET_KEY)

// PATCH Routes

router.patch('/cancel-subscription', async (req, res) => {
    const {userID} = req.body

    try {
        const subscription = await Subscription.findOne({user: userID})
            .lean()
        
        if (subscription) {
            await stripe.subscriptions.del(subscription.stripeSubscriptionID, {at_period_end: true})

            res.json({message: 'Successfully cancelled your subscription. You should receive an email shortly confirming your subscription cancellation.'})
        
            if (subscription.tier === SUBSCRIPTION_TIERS.candidatePremium) {
                await sendNotificationIfEnabled(NOTIFICATIONS.candidatePremiumCancellationInitiated, userID, true, true)
            } else if (subscription.tier === SUBSCRIPTION_TIERS.recruiterPremium) {
                await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumCancellationInitiated, userID, true, true)
            }
        } else {
            res.status(404).json({message: 'Could not find an active subscription for this user.'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// POST Routes

router.post('/create-checkout-session', async (req, res) => {
    const {userID, subscriptionTier} = req.body

    console.log('reached create checkout session endpoint')

    const subscriptionPriceID = SUBSCRIPTION_PRICE_IDS[subscriptionTier]

    if (!subscriptionPriceID) {
        res.status(400).json({message: 'Received an invalid subscription tier.'})
    }

    let stripeCustomerID = null
    try {
        const subscription = await Subscription.findOne({user: userID})
            .lean()
        
        if (subscription) {
            if (subscription.tier === subscriptionTier && subscription.status === 'active') {
                res.status(400).json({message: 'You already have an active subscription.'})
                return
            } else {
                stripeCustomerID = subscription.stripeCustomerID
            }
        }
    } catch (error) {
        res.status(500).json({message: "We're unable to create your subscription right now. Please try again later."})
        return
    }


    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price: subscriptionPriceID,
                quantity: 1,
              },
            ],
            customer: stripeCustomerID || undefined,
            metadata: {
                tier: subscriptionTier,
                userID,
            },
            mode: 'subscription',
            payment_method_types: ['card'],
            success_url: `${CODE_JABBA_DOMAIN}/membership/checkout-success/${subscriptionTier}`,
            cancel_url: `${CODE_JABBA_DOMAIN}/membership/checkout-cancel/${subscriptionTier}`,
          })
        
          res.json({sessionURL: session.url})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router