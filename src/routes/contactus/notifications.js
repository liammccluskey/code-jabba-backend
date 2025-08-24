const {CHANNEL_IDS} = require('../../utils/notifications/constants')

const NOTIFICATIONS = {
    contactUsMessage: (userEmail, message) => ({
        channelID: CHANNEL_IDS.general,
        subject: 'Contact Us Message',
        message: `Message from user with email: ${userEmail} \n\n Message: ${message}`,
        includeMessageWrapper: false,
    })
}

module.exports = {
    NOTIFICATIONS
}