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
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // optional

    // default
    notes: {
        type: String,
        default: ''
    },
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
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    archivedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true})

module.exports = mongoose.model('BugReport', BugReportSchema)