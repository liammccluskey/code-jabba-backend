const mongoose = require('mongoose')

const CompanySchema = mongoose.Schema({
    // required
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },

    // Default
    status: {
        type: String, // pending | review not deleted | review deleted
        required: false,
        default: 'Pending'
    },
    resolved: {
        type: Boolean,
        required: false,
        default: false
    },
    archived: {
        type: Boolean,
        required: false,
        default: false,
    },
}, {timestamps: true})

module.exports = mongoose.model('Company', CompanySchema)

