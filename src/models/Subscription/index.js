const mongoose = require('mongoose')

const SubscriptionSchema = mongoose.Schema({
    // required
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    tier: {
        type: String,
        required: true,
    },
    stripeCustomerID: {
        type: String,
        required: true,
    },
    stripeSubscriptionID: {
        type: String,
        required: true,
    },
    
    // default
    status: { 
        type: String, // active | incomplete | trialing | past_due | canceled | unpaid
        required: false,
        default: 'active'
    },
    users: {
        type: [String],
        required: false,
        default: []
    }
}, {timestamps: true})

module.exports = mongoose.model('Subscription', SubscriptionSchema)

