const mongoose = require('mongoose')

const NotificationSchema = mongoose.Schema({
    // required
    title: {
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
    photoURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    isRead: {
        type: Boolean,
        required: false,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Notification', NotificationSchema)