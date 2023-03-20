require('dotenv/config')

const hasAdminPrivileges = req => {
    const {admin_key} = req.headers
    return admin_key === process.env.ADMIN_KEY
}

const hasSuperAdminPrivileges = req => {
    const {super_admin_key} = req.headers
    return super_admin_key === process.env.SUPER_ADMIN_KEY
}

module.exports = {
    hasAdminPrivileges,
    hasSuperAdminPrivileges
}