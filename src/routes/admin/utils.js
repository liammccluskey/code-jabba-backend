require('dotenv/config')

const isAdmin = req => {
    const {ADMIN_KEY} = req.headers
    return ADMIN_KEY === process.env.ADMIN_KEY
}

const isSuperAdmin = req => {
    const {SUPER_ADMIN_KEY} = req.headers
    return SUPER_ADMIN_KEY === process.env.SUPER_ADMIN_KEY
}

module.exports = {
    isAdmin,
    isSuperAdmin
}