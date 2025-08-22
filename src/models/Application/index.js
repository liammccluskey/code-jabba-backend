const mongoose = require('mongoose')

const ApplicationSchema = mongoose.Schema({
    //required
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    candidateName: {
        type: String,
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    //default
    status: {
        type: String, // applied | viewed | rejected | accepted
        required: false,
        default: 'applied'
    },
    archived: {
        type: Boolean,
        required: false,
        default: false
    },
    viewedAt: {
        type: Date,
        required: false,
        default: null,
    },
    rejectedAt: {
        type: Date,
        required: false,
        default: null,
    },
    acceptedAt: {
        type: Date,
        required: false,
        default: null,
    },
}, {timestamps: true})

ApplicationSchema.index({job: 1, candidate: 1}, {unique: true})
ApplicationSchema.index({ candidateName: 'text' })

module.exports = mongoose.model('Application', ApplicationSchema)

