require('dotenv/config')

const MAX_PAGE_SIZE = 50

const PAGE_SIZES = {
    notifications: 10,
    channelNotifications: 20,
    userSearch: 10,
    bugReports: 10,
    faqs: 10,
    companySearch: 20,
    jobSearch: 10,
    candidateApplicationSearch: 20,
    recruiterApplicationSearch: 50,
}

const STRIPE_SECRET_KEY = {
    DEV: process.env.STRIPE_SECRET_KEY_TEST,
    PROD: process.env.STRIPE_SECRET_KEY_LIVE
}[process.env.PROFILE_ENV]

const DOMAIN = {
    DEV: process.env.DOMAIN_TEST,
    PROD: process.env.DOMAIN_LIVE,
}[process.env.PROFILE_ENV]

module.exports = {
    MAX_PAGE_SIZE,
    PAGE_SIZES,
    STRIPE_SECRET_KEY,
    DOMAIN
}