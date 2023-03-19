require('dotenv/config')

const {getUserFirstName} = require('../../models/User/utils')

const CHANNELS_IDS = {
    main: 'main',
    announcements: 'announcements',
    social: 'social',
}

const APP_NOTIFICATIONS = {
    // notificationID : { channelID, message }
    welcomeToSite: {
        channelID: CHANNELS_IDS.main,
        message: `Welcome to ${process.env.SITE_NAME}`,
    }
}

const EMAIL_NOTIFICATIONS = {
    // notificationID : { channelID, title, message }
    welcomeToSite: user => ({
        channelID: CHANNELS_IDS.main,
        title: `Welcome to ${process.env.SITE_NAME}`,
        message: [
            `Hi ${getUserFirstName(user)}`,
            `Welcome to ${process.env.SITE_NAME}`
        ].join('\n'),
    })
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}