require('dotenv/config')
const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const NOTIFICATIONS = {
    applicationAccepted: {
        channelID: CHANNEL_IDS.jobUpdates,
        subject: `${process.env.SITE_NAME} Account Created`,
        message: `Welcome to ${process.env.SITE_NAME}`,
        includeMessageWrapper: false
    },
    applicationRejected: {
        channelID: CHANNEL_IDS.jobUpdates,
        subject: `${process.env.SITE_NAME} Account Created`,
        message: `Welcome to ${process.env.SITE_NAME}`,
        includeMessageWrapper: false
    },
}

module.exports = {
    NOTIFICATIONS
}