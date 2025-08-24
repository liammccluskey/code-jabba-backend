const express = require('express')
const router = express.Router()

const {SUBSCRIPTION_TIERS, SUBSCRIPTION_PRICE_IDS} = require('../../models/Subscription/constants')
const User = require('../../models/User')
const Subscription = require('../../models/Subscription')
const { STRIPE_SECRET_KEY, CODE_JABBA_DOMAIN } = require('../../constants')
const { logEvent } = require('../events/utils')
const { EVENTS } = require('../events/constants')
const {sendNotificationIfEnabled} = require('../../utils/notifications')
const {NOTIFICATIONS}  = require('./notifications')

const stripe = require('stripe')(STRIPE_SECRET_KEY)

// PATCH Routes

router.patch('/cancel-subscription', async (req, res) => {
    const {userID} = req.body

    try {
        const [subscription=null] = await Subscription.find({user: userID})
            .lean()
        
        if (subscription) {
            await stripe.subscriptions.del(subscription.stripeSubscriptionID, {at_period_end: true})

            res.json({message: 'Successfully cancelled your subscription. You should receive email confirmation of the cancellation shortly.'})
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
    const {userID, stripeCustomerID, subscriptionTier} = req.body

    const subscriptionPriceID = SUBSCRIPTION_PRICE_IDS[subscriptionTier]

    if (!subscriptionPriceID) {
        res.status(400).json({message: 'Received an invalid subscription tier.'})
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

router.post('/webhook', async (req, res) => {
    let event

    try {
        const signature = req.headers['stripe-signature']
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        console.error('Webhook signature verification failed', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const stripeSubscriptionID = session.subscription
                const stripeCustomerID = session.customer
                const {userID, tier} = session.metadata

                await Subscription.updateOne({user: userID}, {
                    user: userID,
                    tier,
                    stripeCustomerID,
                    stripeSubscriptionID,
                    status: 'active'
                }, {upsert: true})

                break
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object
                const {userID} = subscription.metadata

                await Subscription.updateOne(
                    { user: userID },
                    {
                        stripeSubscriptionID: subscription.id,
                        status: subscription.status,
                    }
                )

                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object
                const {userID} = subscription.metadata

                await Subscription.updateOne(
                    { user: userID },
                    {
                        status: subscription.status,
                    }
                )

                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object
                const subscriptionID = invoice.subscription

                const subscription = await Subscription.findOneAndUpdate(
                    { stripeSubscriptionID: subscriptionID },
                    { status: 'active' }
                ).select('userID')
                .lean()

                if (!subscription) {
                    const errorMessage = 'Could not find a subscription matching the given subscriptionID.'
                    console.log(errorMessage)
                    throw Error(errorMessage)
                }

                try {
                    const {userID} = subscription
    
                    if (invoice.billing_reason === 'subscription_create') {
                        await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumPaymentSuccess, userID, true, true)
                        await logEvent(EVENTS.recruiterPremiumSignup, userID)
                    }
                } catch (error) {
                    console.log('Failed to send initial subscription payment success update.')
                }

                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object
                const subscriptionID = invoice.subscription

                const subscription = await Subscription.findOneAndUpdate(
                    { stripeSubscriptionID: subscriptionID },
                    { status: 'past_due' }
                ).select('userID')
                .lean()

                if (!subscription) {
                    const errorMessage = 'Could not find a subscription matching the given subscriptionID.'
                    console.log(errorMessage)
                    throw Error(errorMessage)
                }

                try {
                    const {userID} = subscription
                    
                    await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumPaymentFailed, userID, true, true)
                } catch (error) {
                    console.log('Failed to send subscription cancellation email/app update.')
                }

                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const {userID} = subscription.metadata

                await Subscription.findOneAndUpdate(
                    { user: userID },
                    { status: 'canceled' }
                )

                try {
                    await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumCancellation, userID, true, true)
                    await logEvent(EVENTS.recruiterPremiumCancellation, userID)
                } catch (error) {
                    console.log('Failed to send subscription cancellatino email/app update.')
                }

                break
            }

            default:
                // leave other events blank (no DB update)
                break
        }

        res.json({ received: true })
    } catch (err) {
        console.error('Webhook handling error:', err)
        res.status(500).send('Server error')
    }
})

module.exports = router