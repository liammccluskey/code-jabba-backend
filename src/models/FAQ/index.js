const mongoose = require('mongoose')

const FAQSchema = mongoose.Schema({
    // required
    title: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },

    // optional

    // default
}, {timestamps: true})

FAQSchema.index(
    {
        title: 'text'
    },
    {
        weights: {
            title: 1
        }
    }
)

module.exports = mongoose.model('FAQ', FAQSchema)