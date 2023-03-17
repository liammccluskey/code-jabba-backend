const mongoose = require('mongoose')

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
        type: Object,
        required: false,
        type: {
            theme: {
                type : {
                    tintColor: {
                        type: Number,
                        default: 0
                    },
                    themeColor: {
                        type: Number,
                        default: 0
                    },
                }
            },
            appNotifications: {
                type: {
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
                }
            },
            emailNotifications: {
                type: {
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
                }
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