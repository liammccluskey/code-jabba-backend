const {getUserFirstName} = require('../../models/User/utils')

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