require('dotenv/config')

const {getUserFirstName} = require('../../models/User/utils')

const NOTIFICATION_CHANNEL_IDS = {
    main: 'main',
    announcements: 'announcements',
    social: 'social',
}

const NOTIFICATIONS_EMAIL = 'liammccluskey2@gmail.com'

module.exports = {
    NOTIFICATION_CHANNEL_IDS,
    NOTIFICATIONS_EMAIL
}