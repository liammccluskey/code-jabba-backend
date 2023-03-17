require('dotenv/config')

const CHANNELS = {
    // channelID : { id, title }
    main: {
        id: 'main',
        title: process.env.SITE_NAME
    },
    social: {
        id: 'social',
        title: 'Social'
    },
    announcements: {
        id: 'announcements',
        title: 'Announcements'
    }
}

const NOTIFICATION_FUNCTION_IDS = {
    // functionID : 'functionID'
}

const NOTIFICATIONS = {
    // notificationID : { channelID, message, ?photoURL }
    welcomeToSite: {
        channel: CHANNELS.main,
        message: `Welcome to ${process.env.SITE_NAME}`,
    }
}

module.exports = NOTIFICATIONS