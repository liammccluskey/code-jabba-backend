const mongoose = require('mongoose')

const JobSchema = mongoose.Schema({
    // required
    title: {
        type: String,
        required: true,
    },
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
    position: {
        type: String, // frontend | backend | full-stack | embedded | qa | test
        required: true,
    },
    employmentType: {
        type: String, // internship | part-time | contract | full-time
        required: true,
    },
    setting: {
        type: String, // on-site | hybrid | remote
    },
    experienceLevels: {
        type: [String], // [entry | mid | senior | staff | principal]
        required: true
    },
    minExperienceLevel: {
        type: String,
        required: true,
    },
    maxExperienceLevel: {
        type: String,
        required: true,
    },
    experienceYears: {
        type: [String], // [0, 1-2, 3-4, 5-6, 7-8, 9-10, 11+]
        required: true,
    },
    minExperienceYears: {
        type: Number,
        required: true
    },
    maxExperienceYears: {
        type: Number,
        required: true
    },
    languages: {
        type: [String],
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    applicationType: {
        type: String,
        required: true, // easy-apply | custom
    },
    archive: {
        type: Boolean,
        required: true
    },
    postedAt: {
        type: Date,
        required: true
    },
    requiresClearance: {
        type: Boolean,
        required: true,
    },
    sponsorsVisa: {
        type: String, // visa-yes | visa-no | visa-possibly
        required: true
    },

    // optional
    location: {
        type: String,
        required: false,
        default: ''
    },
    salaryMin: {
        type: Number,
        required: false,
        default: 0
    },
    salaryMax: {
        type: Number,
        required: false,
        default: 0
    },
    salaryExact: {
        type: Number,
        required: false,
        default: 0
    },
    salaryFrequency: {
        type: String, // year | hour
        required: false,
        default: 'year'
    },
    salaryType: {
        type: String, // range | exact | not-provided
        required: false,
        default: 'range'
    },
    estimatedSalaryMin: {
        type: Number,
        required: false,
        default: 0
    },
    estimatedSalaryMax: {
        type: Number,
        required: false,
        default: 0
    },
    applicationURL: {
        type: String,
        required: false,
        default: ''
    },
    questions: {
        type: [String], // [questionID]
        required: false,
        default: []
    },

    // default
    archived: {
        type: Boolean,
        required: false,
        default: false
    },

}, {timestamps: true})

JobSchema.index(
    {title: 'text'},
    {
        weights: {
            title: 1,
        }
    }
)

module.exports = mongoose.model('Job', JobSchema)