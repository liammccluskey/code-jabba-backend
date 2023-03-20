const MAX_PAGE_SIZE = 50

const PAGE_SIZES = {
    notifications: 10,
    channelNotifications: 20,
    userSearch: 10,
}

// 'dev' | 'prod'
const ENV = 'dev'

module.exports = {
    MAX_PAGE_SIZE,
    PAGE_SIZES,
    ENV
}