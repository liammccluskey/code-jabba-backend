const { ENV } = require("../../constants")


const SUBSCRIPTION_TIERS = {
    recruiterPremium: 'recruiterPremium',
    candidatePremium: 'candidatePremium',
}

const SUBSCRIPTION_PRICE_IDS = {
    dev: {
        recruiterPremium: 'price_1OFj2BCRacSb9b39jKojuIoO',
        candidatePremium: 'price_1OFj1hCRacSb9b39FRbGQKAn',
    },
    prod: {
        recruiterPremium: 'price_1OFj0OCRacSb9b39fbeXGZcS',
        candidatePremium: 'price_1OFizwCRacSb9b39DLmHVuDm',
    }
}[ENV]

module.exports = {
    SUBSCRIPTION_TIERS,
    SUBSCRIPTION_PRICE_IDS
}