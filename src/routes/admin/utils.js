require('dotenv/config')

const isAdmin = requestBody => {
    const {ADMIN_KEY} = requestBody
    return ADMIN_KEY === process.env.ADMIN_KEY
}

const isSuperAdmin = requestBody => {
    const {SUPER_ADMIN_KEY} = requestBody
    return SUPER_ADMIN_KEY === process.env.SUPER_ADMIN_KEY
}

module.exports = {
    isAdmin,
    isSuperAdmin
}