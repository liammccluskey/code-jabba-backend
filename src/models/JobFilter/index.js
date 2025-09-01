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
        required: true,
    },
    locations: {
        type: [String],
        required: true,
    },
    employmentTypes: {
        type: [String], // [ internship | part-time | contract | full-time ]
        required: true,
    },
    positions: {
        type: [String], // frontend | backend | full-stack | embedded | qa | test
        required: true,
    },
    experienceLevels: {
        type: [String], // [entry | mid | senior | staff | principal]
        required: true
    },
    experienceYears: {
        type: [String], // [0, 1-2, 3-4, 5-6, 7-8, 9-10, 11+]
        required: true,
    },
    includedSkills: {
        type: [String],
        required: true
    },
    excludedSkills: {
        type: [String],
        required: true
    },
    includedLanguages: {
        type: [String],
        required: true
    },
    excludedLanguages: {
        type: [String],
        required: true
    },
    salaryMin: {
        type: Number,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('JobFilter', JobFilterSchema)