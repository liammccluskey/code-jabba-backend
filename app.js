const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')
const qs = require('qs')

const {hasAdminPrivileges} = require('./src/routes/admin/utils')

// Stripe Webhook route

const subscriptionsRoute = require('./src/routes/subscriptions')
app.use('/subscriptions', subscriptionsRoute)

// Middleware

app.use(cors())
app.use(express.json())
app.set('query parser', str => qs.parse(str))

app.use((req, res, next) => {
    if (process.env.PROFILE_ENV === 'DEV') {
        console.log(req.method + ': ' + req.originalUrl)
    }
    next()
})

app.use((req, res, next) => {
    const {api_key} = req.headers

    if (api_key !== process.env.CODE_JABBA_API_KEY) {
        res.status(500).send({message: 'Invalid api key.'})
    } else {
        next()
    }
})

app.use((req, res, next) => {
    const {originalUrl} = req

    if (originalUrl.split('/')[1] === 'admin') {
        if (hasAdminPrivileges(req)) {
            next()
        } else {
            res.status(500).json({message: 'This operation requires admin privileges to complete.'})
        }
    } else {
        next()
    }
})

// Routes

const usersRoute = require('./src/routes/users')
app.use('/users', usersRoute)

const notificationsRoute = require('./src/routes/notifications')
app.use('/notifications', notificationsRoute)

const bugReportsRoute = require('./src/routes/bugreports')
app.use('/bugreports', bugReportsRoute)

const faqRoute = require('./src/routes/faq')
app.use('/faq', faqRoute)

const adminUsersRoute = require('./src/routes/admin/users')
app.use('/admin/users/', adminUsersRoute)

const adminBugReportsRoute = require('./src/routes/admin/bugreports')
app.use('/admin/bugreports', adminBugReportsRoute)

const adminFAQRoute = require('./src/routes/admin/faq')
app.use('/admin/faq', adminFAQRoute)

const adminStatsRoute = require('./src/routes/admin/stats')
app.use('/admin/stats', adminStatsRoute)

const membershipRoute = require('./src/routes/membership')
app.use('/membership', membershipRoute)

const companiesRoute = require('./src/routes/companies')
app.use('/companies', companiesRoute)

const jobsRoute = require('./src/routes/jobs')
app.use('/jobs', jobsRoute)

const applicationsRoute = require('./src/routes/applications')
app.use('/applications', applicationsRoute)

const contactUsRoute = require('./src/routes/contactus')
app.use('/contact-us', contactUsRoute)

const statsRoute = require('./src/routes/stats')
app.use('/stats', statsRoute)

const eventsRoute = require('./src/routes/events')
app.use('/events', eventsRoute)

const jobFiltersRoute = require('./src/routes/jobFilters')
app.use('/job-filters', jobFiltersRoute)

const jobPostViewsRoute = require('./src/routes/jobPostViews')
app.use('/job-post-views', jobPostViewsRoute)


const connectToMongoDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_DB_CONNECTION,
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true,
            },
        )
        console.log('connected to DB')
    } catch (error) {
        console.log('Error connecting to DB: ' + error)
    }
}

connectToMongoDB()
const server = app.listen(process.env.PORT || 3001)
