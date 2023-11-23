const mongoose = require('mongoose')

const RewardSchema = mongoose.Schema({
    // required
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    referree: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },

    // default
    claimed: {
        type: Boolean,
        required: false,
        default: false,
    },
    active: { // true if referree has signed up for premium
        type: Boolean,
        required: false,
        default: false,
    }
}, {timestamps: true})

RewardSchema.index({referrer: 1, referree: 1}, {unique: true})

module.exports = mongoose.model('Reward', RewardSchema)

