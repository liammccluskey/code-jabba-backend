const mongoose = require('mongoose')

const CompanySchema = mongoose.Schema({
    // required
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true,
    },

    // optional
    linkedInURL: {
        type: String,
        required: false,
        default: null
    },
    glassDoorURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    recruiters: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        required: false,
        default: []
    },
    admins: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        required: false,
        default: []
    },
}, {timestamps: true})

module.exports = mongoose.model('Company', CompanySchema)

