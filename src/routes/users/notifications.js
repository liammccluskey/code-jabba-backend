const {getUserFirstName} = require('../../models/User/utils')
const {CHANNEL_IDS} = require('../../utis/notifications/constants')

const APP_NOTIFICATIONS = {
    welcomeToSite: {
        channelID: CHANNEL_IDS.general,
        message: `Welcome to ${process.env.SITE_NAME}`,
    }
}

const EMAIL_NOTIFICATIONS = {
    welcomeToSite: {
        channelID: CHANNEL_IDS.general,
        subject: `${process.env.SITE_NAME} account created`,
        message: `Welcome to ${process.env.SITE_NAME}`,
    }
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}