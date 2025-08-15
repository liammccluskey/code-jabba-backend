require('dotenv/config')
const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const NOTIFICATIONS = {
    welcomeToSite: {
        channelID: CHANNEL_IDS.general,
        subject: `${process.env.SITE_NAME} Account Created`,
        message: `Welcome to ${process.env.SITE_NAME}`,
        includeMessageWrapper: true
    },
}

module.exports = {
    NOTIFICATIONS
}