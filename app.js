const express = require("express")
const bcrypt = require("bcrypt")
const userModel = require("./models/user")
const postModel = require("./models/post")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

const app = express()
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


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

app.get("/profile", isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email: req.user.email}).populate('posts')
    res.render("profile", {user: user})
})

app.get("/like/:id", isLoggedIn, async (req,res)=>{
    
    let post = await postModel.findOne({_id: req.params.id}).populate('user')


    if (post.likes.indexOf(req.user._id)===-1){
     post.likes.push(req.user._id)
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user._id),1)
    }
    await post.save()
    res.redirect("/profile")
})

app.get("/edit/:id", isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate('user')   
    res.render("edit", {post})
})

app.post("/update/:id", isLoggedIn, async (req,res)=>{
    let post = await postModel.findOneAndUpdate({_id:req.params.id},{content: req.body.content})
    res.redirect("/profile")
})

app.post("/post", isLoggedIn, async (req,res)=>{
    let user = await userModel.findOne({email: req.user.email})
    let {content} = req.body;

    let post = await postModel.create({
        user: user._id,
        content: content
    })
    user.posts.push(post._id)
    await user.save();
    res.redirect("profile")
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
                let token = jwt.sign({email: email, _id: user._id}, "secret_key")
                res.cookie("token", token)
                res.redirect("profile")
            });
        });
    } 
})

app.post("/login", async (req, res)=>{
    let {email, password} = req.body
    let user = await userModel.findOne({email:email})
    if (user){
        bcrypt.compare(password, user.password , function(err, result) {
            let token = jwt.sign({email: email, _id: user._id}, "secret_key")
                res.cookie("token", token)
                res.redirect("profile")
        });
    }
    else{
        res.status(500).send("something went wrong")
    }
})


function isLoggedIn(req ,res, next){
    if(req.cookies.token == '') {
        res.status(500).send("you must be logged in") 
    }

    else{
        let data = jwt.verify(req.cookies.token, "secret_key")
        req.user = data
        next();
    }
}


module.exports = app