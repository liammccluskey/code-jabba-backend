const express = require('express')
const router = express.Router()

const {SUBSCRIPTION_TIERS, SUBSCRIPTION_PRICE_IDS} = require('../../models/Subscription/constants')
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
        console.log(error.message)
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
                ).select('userID tier')
                .lean()

                if (!subscription) {
                    const errorMessage = 'Could not find a subscription matching the given subscriptionID.'
                    console.log(errorMessage)
                    throw Error(errorMessage)
                }

                try {
                    const {userID, tier} = subscription
    
                    if (invoice.billing_reason === 'subscription_create') {
                        switch (tier) {
                            case SUBSCRIPTION_TIERS.recruiterPremium:
                                await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumPaymentSuccess, userID, true, true)
                                await logEvent(EVENTS.recruiterPremiumSignup, userID)
                                break
                            case SUBSCRIPTION_TIERS.candidatePremium:
                                await sendNotificationIfEnabled(NOTIFICATIONS.candidatePremiumPaymentSuccess, userID, true, true)
                                await logEvent(EVENTS.candidatePremiumSignup, userID)
                                break
                        }
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
                    const {userID, tier} = subscription
                        switch (tier) {
                            case SUBSCRIPTION_TIERS.recruiterPremium:
                                await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumPaymentFailed, userID, true, true)
                                break
                            case SUBSCRIPTION_TIERS.candidatePremium:
                                await sendNotificationIfEnabled(NOTIFICATIONS.candidatePremiumPaymentFailed, userID, true, true)
                                break
                        }
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
                    switch (tier) {
                        case SUBSCRIPTION_TIERS.recruiterPremium:
                            await sendNotificationIfEnabled(NOTIFICATIONS.recruiterPremiumCancellation, userID, true, true)
                            await logEvent(EVENTS.recruiterPremiumCancellation, userID)
                            break
                        case SUBSCRIPTION_TIERS.candidatePremium:
                            await sendNotificationIfEnabled(NOTIFICATIONS.candidatePremiumCancellation, userID, true, true)
                            await logEvent(EVENTS.candidatePremiumCancellation, userID)
                            break
                    }
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