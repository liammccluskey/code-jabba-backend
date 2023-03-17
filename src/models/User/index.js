const mongoose = require('mongoose')

const ThemeSettingsSchema = mongoose.Schema({
    themeColor: {
        type: Number,
    },
    tintColor: {
        type: Number,
    }
})

const NotificationsSettingsSchema = mongoose.Schema({
    generalEnabled: {
        type: Boolean,
    },
    announcementsEnabled: {
        type: Boolean,
    },
    socialEnabled: {
        type: Boolean,
    }
})

const SettingsSchema = mongoose.Schema({
    theme: {
        type: ThemeSettingsSchema
    },
    appNotifications: {
        type: NotificationsSettingsSchema
    },
    emailNotifications: {
        type: NotificationsSettingsSchema
    }
})

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
        type: SettingsSchema,
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