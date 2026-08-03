const express = require("express")
const bcrypt = require("bcrypt")
const userModel = require("./models/user")
const jwt = require("jsonwebtoken")

const app = express()
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.get('/', function (req,res){
    res.render("register")
})

app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/logout", (req,res)=>{
    res.cookie("token", "")
    res.send("/login")
})

app.post("/register", async (req,res)=>{
    let {email, name, username, password} = req.body
    let user = await userModel.findOne({email: email, username: username})
    if(user){
        res.status(500).send("something went wrong")
    } 
    else{
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt,async function(err, hash) {
                let userCreated = await userModel.create({
                    name: name, 
                    username: username,
                    email: email,
                    password: hash
                })
                let token = jwt.sign({email: email}, "secret_key")
                res.cookie("token", token)
                res.send("home")
            });
        });
    } 
})

app.post("/login", async (req, res)=>{
    let {email, password} = req.body
    let user = await userModel.findOne({email:email})
    if (user){
        bcrypt.compare(password, user.password , function(err, result) {
            let token = jwt.sign({email: email}, "secret_key")
                res.cookie("token", token)
                res.send("home")
        });
    }
    else{
        res.status(500).send("something went wrong")
    }
})


module.exports = app