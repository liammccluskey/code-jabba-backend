const getUserFirstName = user => {
    const hasName = !!user.displayName
    return hasName ? user.displayName.split(' ')[0] : ''
}

module.exports = {
    getUserFirstName
}