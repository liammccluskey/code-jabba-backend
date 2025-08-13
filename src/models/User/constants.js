const hiddenUserKeys = [
    'isAdmin',
    'isSuperAdmin',
    'adminKey',
    'superAdminKey'
]

const HiddenUserKeysSelectStatement = hiddenUserKeys.map(key => `-${key}`)
    .join(' ')

module.exports = {
    HiddenUserKeysSelectStatement
}