const mongoose = require('mongoose')

const CompanySchema = mongoose.Schema({
    // required
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model('Company', CompanySchema)

