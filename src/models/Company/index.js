const mongoose = require('mongoose')

const CompanySchema = mongoose.Schema({
    // required
    name: {
        type: String,
        required: true,
        unique: true,
    },

    // optional
    description: {
        type: String,
        required: false,
        default: undefined
    },
    headquartersAddress: { // headquartersAddress
        type: String,
        required: false,
        default: undefined
    },
    linkedInURL: {
        type: String,
        required: false,
        default: undefined
    },
    glassDoorURL: {
        type: String,
        required: false,
        default: undefined
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

CompanySchema.index({ linkedInURL: 1 }, { unique: true, sparse: true })
CompanySchema.index({ glassDoorURL: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Company', CompanySchema)

