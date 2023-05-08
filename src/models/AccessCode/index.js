const mongoose = require('mongoose')

const AccessCodeSchema = mongoose.Schema({
    // required
    title: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    
    // optional

    // default
    claimed: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

AccessCodeSchema.index(
    {
        title: 'text'
    },
    {
        weights: {
            title: 1
        }
    }
)

module.exports = mongoose.model('AccessCode', AccessCodeSchema)