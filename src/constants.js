require('dotenv/config')

const MAX_PAGE_SIZE = 50

const PAGE_SIZES = {
    notifications: 10,
    channelNotifications: 20,
    userSearch: 10,
    bugReports: 10,
    faqs: 10,
    companySearch: 20,
    jobSearch: 20,
    candidateApplicationSearch: 20,
    recruiterApplicationSearch: 50,
    rewardsSearch: 20,
}

const ENV = 'dev' // dev | prod

const STRIPE_SECRET_KEY = {
    dev: process.env.STRIPE_SECRET_KEY_TEST,
    prod: process.env.STRIPE_SECRET_KEY_LIVe
}[ENV]

const DOMAIN = {
    dev: process.env.DOMAIN_TEST,
    prod: process.env.DOMAIN_LIVE,
}[ENV]

module.exports = {
    MAX_PAGE_SIZE,
    PAGE_SIZES,
    ENV,
    STRIPE_SECRET_KEY,
    DOMAIN
}