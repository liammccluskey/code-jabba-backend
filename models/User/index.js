const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    // required
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        default: null,
        unique: true
    },

    // optional
    photoURL: {
        type: String,
        required: false,
        default: null
    },

    // default
    tintColor: {
       type: Number,
       required: false,
       default: 0
    },
    themeColor: {
       type: Number,
       required: false,
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