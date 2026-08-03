const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    title: String,
    date: {
        type: Date,
        default: Date.now()
    }
})