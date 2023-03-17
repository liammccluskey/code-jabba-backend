const mongoose = require('mongoose')

const ThemeType = {
    themeColor: {
        type: Number
    },
    tintColor: {
        type: Number
    }
}

const NotificationsType = {
    generalEnabled: {
        type: Boolean,
    },
    announcementsEnabled: {
        type: Boolean,
    },
    socialEnabled: {
        type: Boolean,
    }
}

const UserSchema = mongoose.Schema({
    // required
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        default: null,
        unique: true
    },

    // optional
    displayName: {
        type: String,
        required: false,
    },
    photoURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    settings: {
        required: false,
        type: {
            theme: {
                type: ThemeType
            },
            appNotifications: {
                type: NotificationsType
            },
            emailNotifications: {
                type: NotificationsType
            }
        },
        default: {
            theme: {
                themeColor: 0,
                tintColor: 0
            },
            appNotifications: {
                generalEnabled: true,
                announcementsEnabled: true,
                socialEnabled: true
            },
            emailNotifications: {
                generalEnabled: true,
                announcementsEnabled: false,
                socialEnabled: false
            }
        }
    }
}, {timestamps: true})

UserSchema.index(
    {
        displayName: 'text'
    },
    {
        weights: {
            displayName: 1
        }
    }
)

module.exports = mongoose.model('User', UserSchema)