const mongoose = require('mongoose')

const NotificationSchema = mongoose.Schema({
    // required
    channelID: {
        type: String,
        required: false,
        default: null, // social | general | job-update
    },
    message: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // optional

    // default
    isRead: {
        type: Boolean,
        required: false,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Notification', NotificationSchema)