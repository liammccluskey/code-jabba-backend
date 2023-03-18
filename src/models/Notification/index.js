const mongoose = require('mongoose')

const NotificationSchema = mongoose.Schema({
    // required
    channelID: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
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