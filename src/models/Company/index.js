const mongoose = require('mongoose')

const CompanySchema = mongoose.Schema({
    // required
    name: {
        type: String,
        required: true,
        unqiue: true,
        index: true
    },
    description: {
        type: String,
        required: true,
    },
    headquarters: {
        type: String,
        required: true,
    },
    linkedInURL: {
        type: String,
        required: true,
        unqiue: true
    },

    // optional
    glassDoorURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    pendingRecruiters: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        required: false,
        default: []
    },
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

CompanySchema.index(
    {
        name: 'text',
    },
    {
        weights: {
            name: 1,
        }
    }
)

module.exports = mongoose.model('Company', CompanySchema)

