const MAX_PAGE_SIZE = 50

const PAGE_SIZES = {
    notifications: 10,
    channelNotifications: 20,
    userSearch: 10,
    bugReports: 10,
}

// 'dev' | 'prod'
const ENV = 'dev'

const LOGO_URL = 'https://firebasestorage.googleapis.com/v0/b/template-project-7b481.appspot.com/o/logo.png?alt=media&token=dda7dd91-c37f-4373-9b6a-99c87fd6e742'

module.exports = {
    MAX_PAGE_SIZE,
    PAGE_SIZES,
    ENV,
    LOGO_URL
}