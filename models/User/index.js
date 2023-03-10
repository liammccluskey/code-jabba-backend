const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        default: null,
        unique: true
    },
    photoURL: {
        type: String,
        default: null
    },
    tintColor: {
       type: Number,
       default: 0
    },
    themeColor: {
       type: Number,
       default: 0
    },
}, {timestamps: true})

UserSchema.index(
    {
        displayName: 'text'
    },
    {
        weights: {
            displayName: 1
        }
    }
)

module.exports = mongoose.model('User', UserSchema)