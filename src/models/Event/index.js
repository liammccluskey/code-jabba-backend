const mongoose = require('mongoose')

const EventSchema = mongoose.Schema({
    // optional
    event: {
        type: String,
        required: true
    },

    // optional
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
        default: undefined,
    },
}, {timestamps: true})

module.exports = mongoose.model('Event', EventSchema)

