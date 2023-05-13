const express = require('express')
const router = express.Router()
require('dotenv/config')
const stripe = require('stripe')(process.env.STRIPE_API_URL)

const {SUBSCRIPTION_PRICE_IDS} = require('./constants')

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
            success_url: `http://${process.env.DOMAIN_NAME}/checkoutsuccess`,
            cancel_url: `http://${process.env.DOMAIN_NAME}/checkoutcancel`,
          })
        
          res.redirect(303, session.url)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

module.exports = router