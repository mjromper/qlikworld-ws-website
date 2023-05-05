const mongoose = require('mongoose')
//mongoose.set('debug', true)


const userSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now,
        index : true
    },
    updated: {
        type: Date,
        default: Date.now
    },
    displayName: String,
    upn: String,
    sub: String,
    oid: {
        type: String,
        index: true
    },
    role: {
        type: String,
        default: "user"
    },
    lastLogin: {
        type: Date
    },
    qcsUserId: {
        type: String
    },
    qcsUserSubject: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    jobTitle: {
        type: String
    },
    mail: {
        type: String
    }
});


module.exports = mongoose.model('User', userSchema);