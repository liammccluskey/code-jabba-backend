require('dotenv/config')


const SUBSCRIPTION_TIERS = {
    recruiterPremium: 'recruiterPremium',
    candidatePremium: 'candidatePremium',
}

const SUBSCRIPTION_PRICE_IDS = {
    DEV: {
        recruiterPremium: 'price_1S2BgEJYyxSlwqx9CyYPH0LB',
        candidatePremium: 'price_1S2BbVJYyxSlwqx9XpFSdSi9',
    },
    PROD: {
        recruiterPremium: '',
        candidatePremium: '',
    }
}[process.env.PROFILE_ENV]

module.exports = {
    SUBSCRIPTION_TIERS,
    SUBSCRIPTION_PRICE_IDS
}