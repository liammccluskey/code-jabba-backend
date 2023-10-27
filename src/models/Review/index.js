const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({
    // required
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model('Review', ReviewSchema)

