const mongoose = require('mongoose')

const ApplicationSchema = mongoose.Schema({
    //required
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
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
}, {timestamps: true})

module.exports = mongoose.model('Application', ApplicationSchema)

