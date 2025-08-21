const mongoose = require('mongoose')

const JobFilterSchema = mongoose.Schema({
    // required
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settings: {
        type: [String], // [ on-site | hybrid | remote ]
        required: false,
    },
    locations: {
        type: [String],
        required: false,
    },
    employmentTypes: {
        type: [String], // [ internship | part-time | contract | full-time ]
        required: false,
    },
    positions: {
        type: [String], // frontend | backend | full-stack | embedded | qa | test
        required: false,
    },
    experienceLevels: {
        type: [String], // [entry | mid | senior | staff | principal]
        required: false
    },
    experienceYears: {
        type: [String], // [0, 1-2, 3-4, 5-6, 7-8, 9-10, 11+]
        required: false,
    },
    includedSkills: {
        type: [String],
        required: false
    },
    excludedSkills: {
        type: [String],
        required: false
    },
    includedLanguages: {
        type: [String],
        required: false
    },
    excludedLanguages: {
        type: [String],
        required: false
    },
}, {timestamps: true})

module.exports = mongoose.model('JobFilter', JobFilterSchema)