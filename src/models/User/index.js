const mongoose = require('mongoose')
const moment = require('moment')

const UserSchema = mongoose.Schema({
    // required
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        default: null,
        unique: true,
        index: true
    },
    isRecruiter: {
        type: Boolean,
        required: true,
    },

    // optional
    displayName: {
        type: String,
        required: false,
    },
    photoURL: {
        type: String,
        required: false,
    },

    // default
    phoneNumber: {
        type: String,
        required: false,
        default: undefined
    },
    address: {
        type: String,
        required: false,
        default: null
    },
    birthdayDay: {
        type: String,
        required: false,
        default: '1'
    },
    birthdayMonth: {
        type: String,
        required: false,
        default: '1'
    },
    birthdayYear: {
        type: String,
        required: false,
        default: moment().year().toString()
    },
    languages: {
        type: [String],
        required: false,
        default: []
    },
    skills: {
        type: [String],
        required: false,
        default: []
    },
    linkedInURL: {
        type: String,
        required: false,
        default: undefined,
        unique: true,
        sparese: true,
    },
    githubURL: {
        type: String,
        required: false,
        default: ''
    },
    portfolioURL: {
        type: String,
        required: false,
        default: ''
    },
    leetcodeURL: {
        type: String,
        required: false,
        default: ''
    },
    resumeURL: {
        type: String,
        required: false,
        default: null
    },
    educations: {
        type: [{
            school: String, 
            degree: String, 
            fieldOfStudy: String, 
            startMonth: String, 
            startYear: String, 
            endMonth: String,
            endYear: String,
            isCurrent: Boolean,
            id: String,
        }],
        required: false,
        default: [],
    },
    workExperiences: {
        type: [Object],
        required: false,
        default: [],
    },
    // workExperience Type: REASON : shows cast to [string] error
    // [{
    //     company: String, 
    //     jobTitle: String, 
    //     setting: String,
    //     type: String, 
    //     position: String,
    //     languages: [String],
    //     skills: [String],
    //     description: String,
    //     startMonth: String, 
    //     startYear: String, 
    //     endMonth: String,
    //     endYear: String,
    //     isCurrent: Boolean,
    //     id: String
    // }]  
    projects: {
        type: [{
            title: String, 
            url: String,
            codeURL: String,
            languages: [String],
            skills: [String],
            description: String, 
            startMonth: String, 
            startYear: String, 
            endMonth: String,
            endYear: String,
            isCurrent: Boolean,
            id: String,
        }],
        required: false,
        default: [],
    },
    questions: {
        type: [{
            id: String,
            answer: String,
        }],
        required: false,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    adminKey: {
        type: String,
        default: undefined
    },
    superAdminKey: {
        type: String,
        default: undefined
    },
    settings: {
        theme: {
            themeColor: {
                type: Number,
                default: 0
            },
            tintColor: {
                type: Number,
                default: 0
            }
        },
        appNotifications: {
            generalEnabled: {
                type: Boolean,
                default: true
            },
            socialEnabled: {
                type: Boolean,
                default: true
            },
            jobUpdatesEnabled: {
                type: Boolean,
                default: true,
            }
        },
        emailNotifications: {
            generalEnabled: {
                type: Boolean,
                default: true
            },
            socialEnabled: {
                type: Boolean,
                default: true
            },
            jobUpdatesEnabled: {
                type: Boolean,
                default: true
            }
        }
    },
}, {timestamps: true})

UserSchema.index(
    {
        displayName: 'text',
    },
    {
        weights: {
            displayName: 1,
        }
    }
)

UserSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('User', UserSchema) 