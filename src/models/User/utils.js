const getUserFirstName = displayName => {
    const hasName = !!displayName
    return hasName ? displayName.split(' ')[0] : `${process.env.SITE_NAME} user`
}

module.exports = {
    getUserFirstName
}