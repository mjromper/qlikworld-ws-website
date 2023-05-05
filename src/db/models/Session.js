const mongoose = require('mongoose')
//mongoose.set('debug', true)


const schema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now,
        index : true
    },
    updated: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Types.ObjectId, 
        ref: "SessionDetails"
    },
    user: {
        type: mongoose.Types.ObjectId, 
        ref: "User"
    },
    disabled: {
        type: String
    }
});


module.exports = mongoose.model('Session', schema)