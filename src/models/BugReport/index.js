const mongoose = require('mongoose')

const BugReportSchema = mongoose.Schema({
    // required
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    // optional

    // default
    resolved: {
        type: Boolean,
        default: false
    },
    highPriority: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('BugReport', BugReportSchema)