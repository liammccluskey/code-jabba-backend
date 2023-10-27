const mongoose = require('mongoose')

const JobSchema = mongoose.Schema({
    // required
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobType: {
        type: String, // internship | part-time | full-time
        required: true,
    },
    experienceLevel: {
        type: String, // entry | mid | senior | staff | principal
        required: true
    },
    experienceYears: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    isRemote: {
        type: Boolean,
        required: true
    },


    // optional
    location: {
        type: String,
        required: false,
        default: null
    },
    frontendSkills: {
        type: [{title: String, years: Number}],
        required: true
    },
    backendSkills: {
        type: [{title: String, years: Number}],
        required: true
    },
    otherSkills: {
        type: [{title: String, years: Number}],
        required: true
    },
    salaryMin: {
        type: Number,
        required: false,
        default: null
    },
    salaryMax: {
        type: Number,
        required: false,
        default: null
    },
    salaryCurrency: {
        type: Number,
        required: false,
        default: null
    },
    salaryUnit: {
        type: String, // year | hour
        required: false,
        default: null
    },
    benefits: {
        type: [String],
        required: false,
        default: null
    },
    interviewSteps: {
        type: [String],
        required: false,
        default: null
    },
    applicationURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    archived: {
        type: Boolean,
        required: false,
        default: false
    },

}, {timestamps: true})

module.exports = mongoose.model('Job', JobSchema)