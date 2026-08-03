const mongoose = require("mongoose")

function connectDB(){
    mongoose.connect("mongodb://127.0.0.1:27017/mini")
    console.log("connected to db")
}

module.exports = connectDB