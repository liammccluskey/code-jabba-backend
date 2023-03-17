const mongoose = require('mongoose')

const ThemeSettingsSchema = mongoose.Schema({
    themeColor: {
        type: Number,
        default: 0
    },
    tintColor: {
        type: Number,
        default: 0
    }
})

const NotificationsSettingsSchema = mongoose.Schema({
    generalEnabled: {
        type: Boolean,
        default: true
    },
    announcementsEnabled: {
        type: Boolean,
        default: true,
    },
    socialEnabled: {
        type: Boolean,
        default: true,
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
        type: SettingsSchema
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