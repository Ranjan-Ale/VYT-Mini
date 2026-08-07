const mongoose = require("mongoose")

const ownerSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    isadmin: Boolean,
    product: {
        type: Array,
        default: []
    },
    picture: String,
    gstno: String,
})

const ownerModel = mongoose.model("owner", ownerSchema)

module.exports = ownerModel