require('dotenv/config')

module.exports.NOTIFICATION_FUNCTIONS = {
    // functionID : 'functionID'
}

module.exports.NOTIFICATIONS = {
    // notificationID : { title, message, ?photoURL }
    welcomeToSite: {
        title: `Welcome to ${process.env.SITE_NAME}`,
        message: 'Welcome to the site.'
    }
}