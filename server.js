const app = require("./app")
const connectDB = require("./db/db")

app.listen(3000,()=>{
    console.log("server is running");
})

connectDB()