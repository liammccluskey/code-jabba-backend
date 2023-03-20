const {getUserFirstName} = require('../../models/User/utils')
const {NOTIFICATION_CHANNEL_IDS} = require('../../utis/notifications/constants')

const APP_NOTIFICATIONS = {
    notificationID: {
        channelID: '',
        message: ''
    }
}

const EMAIL_NOTIFICATIONS = {
    notificationID: user => ({
        channelID: '',
        title: '',
        message: [
            `Hi ${getUserFirstName(user)},`,
            '',
        ].join('\n')
    })
}

module.exports = {
    APP_NOTIFICATIONS,
    EMAIL_NOTIFICATIONS
}