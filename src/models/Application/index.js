const mongoose = require('mongoose')

const ApplicationSchema = mongoose.Schema({
    //required
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

    // optional
    questions: {
        type: [{id: String, answer: String}],
        required: false,
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
        type: String,
        required: false,
        default: null,
    },
    rejectedAt: {
        type: String,
        required: false,
        default: null,
    },
    acceptedAt: {
        type: String,
        required: false,
        default: null,
    },
}, {timestamps: true})

ApplicationSchema.index({job: 1, candidate: 1}, {unique: true})

module.exports = mongoose.model('Application', ApplicationSchema)

