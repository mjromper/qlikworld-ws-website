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
    qaUrl: {
        type: String
    },
    qaToken: {
        type: String
    },
    cloudshareClassId: {
        type: String
    }

});


module.exports = mongoose.model('SessionDetails', schema)