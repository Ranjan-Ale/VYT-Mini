const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profile: {
        type: String,
        default: "default.jpg"
    },
    posts: [{type: mongoose.Schema.Types.ObjectId, ref:'post'}]
    
})

const userModel = mongoose.model('user', userSchema)
module.exports = userModel