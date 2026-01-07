const mongoose = require('mongoose')

const JobPostViewSchema = mongoose.Schema({
    // required
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job',
    },

    // default
    didClickApply: {
        type: Boolean,
        required: false,
        default: false
    }
}, {timestamps: true})

JobPostViewSchema.index({user: 1, job: 1}, {unique: true})

module.exports = mongoose.model('JobPostView', JobPostViewSchema)

