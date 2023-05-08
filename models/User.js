const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    //ObjectId automatically created (_id)
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: ["User"]
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('User', userSchema)