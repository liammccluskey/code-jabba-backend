const express = require('express')
const router = express.Router()

const {SUBSCRIPTION_TIERS, SUBSCRIPTION_PRICE_IDS} = require('../../models/Subscription/constants')
const User = require('../../models/User')
const Subscription = require('../../models/Subscription')
const { STRIPE_SECRET_KEY, CODE_JABBA_DOMAIN } = require('../../constants')
const { logEvent } = require('../events/utils')
const { EVENTS } = require('../events/constants')

const stripe = require('stripe')(STRIPE_SECRET_KEY)

// PATCH Routes

router.patch('/cancel-subscription', async (req, res) => {
    const {userID} = req.body

    try {
        const [subscription=null] = await Subscription.find({user: userID})
            .lean()
        
            if (subscription) {
                await Subscription.findByIdAndUpdate(subscription._id, {
                    status: 'canceled',
                })
                await stripe.subscriptions.del(subscription.stripeSubscriptionID, {at_period_end: true})

                res.json({message: 'Successfully cancelled your subscription.'})
            } else {
                res.status(404).json({message: 'Could not find a subscription for this user'})
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

        if (signedUpForPremium) {
            if (subscriptionTier === SUBSCRIPTION_TIERS.candidatePremium) {
                await logEvent(EVENTS.candidatePremiumSignup)
            } else {
                await logEvent(EVENTS.recruiterPremiumSignup)
            }
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
                const customerId = invoice.customer

                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionID: subscriptionID },
                    { status: 'active' }
                )

                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object
                const subscriptionID = invoice.subscription

                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionId: subscriptionId },
                    { status: 'past_due' }
                )

                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const {userID} = subscription.metadata

                await Subscription.findOneAndUpdate(
                    { user: userID },
                    { status: 'canceled' }
                )

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