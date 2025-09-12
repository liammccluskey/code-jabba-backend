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
        recruiterPremium: 'price_1S6JXFQsae153RTX1VgkhhVS',
        candidatePremium: 'price_1S6JXKQsae153RTXr5DLZscj',
    }
}[process.env.PROFILE_ENV]


module.exports = {
    SUBSCRIPTION_TIERS,
    SUBSCRIPTION_PRICE_IDS
}