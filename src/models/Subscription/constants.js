require('dotenv/config')


const SUBSCRIPTION_TIERS = {
    recruiterPremium: 'recruiterPremium',
    candidatePremium: 'candidatePremium',
}

const SUBSCRIPTION_PRICE_IDS = {
    DEV: {
        recruiterPremium: 'price_1OFj2BCRacSb9b39jKojuIoO',
        candidatePremium: 'price_1OFj1hCRacSb9b39FRbGQKAn',
    },
    PROD: {
        recruiterPremium: 'price_1OFj0OCRacSb9b39fbeXGZcS',
        candidatePremium: 'price_1OFizwCRacSb9b39DLmHVuDm',
    }
}[process.env.PROFILE_ENV]

module.exports = {
    SUBSCRIPTION_TIERS,
    SUBSCRIPTION_PRICE_IDS
}