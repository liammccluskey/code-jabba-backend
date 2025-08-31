const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const {SUBSCRIPTION_TIERS} = require('../../models/Subscription/constants')
const Subscription = require('../../models/Subscription')
const { STRIPE_SECRET_KEY } = require('../../constants')
const { logEvent } = require('../events/utils')
const { EVENTS } = require('../events/constants')
const {sendNotificationIfEnabled} = require('../../utils/notifications')
const {NOTIFICATIONS}  = require('./notifications')

const stripe = require('stripe')(STRIPE_SECRET_KEY)

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
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
        console.log('event type: ' + event.type)
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

                console.log(JSON.stringify(
                    {subscriptionID: subscriptionID || 'no subscription id'}
                , null, 4))

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