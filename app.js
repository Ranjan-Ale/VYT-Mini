const express = require("express")
const userModel = require("./models/user")
const postModel = require("./models/post")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const path = require("path")
const upload = require("./config/multer_config")

const app = express()

app.set("view engine", 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))


// rendering various pages in the website i.e GET API
app.get("/", (req,res)=>{
    res.render("register")
})

app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/profile", isLoggedIn, async (req,res)=>{
  let user = await userModel.findOne({_id: req.user._id}).populate('posts') 
  res.render("profile", {user: user})
})

app.get("/update/profile", (req,res)=>{
    res.render("update_pp")
})

app.get("/logout", (req,res)=>{
    if (req.cookies){
        res.cookie("token","")
        res.redirect("/login")
    }
})


// handling various data related tasks provided by the user i.e POST API
app.post("/register", async (req,res)=>{
    const {username, email, password} = req.body
    const user = await userModel.findOne({
         $or: [
            {email: email},
            {username: username}
        ]
    })

    if(user){
        res.send("user exists")
    }
    else{
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                let user = await userModel.create({
                    username: username,
                    email: email,
                    password: hash
                })
            let token = jwt.sign({_id: user._id, email: email},"secret_key")
            res.cookie("token", token)
            res.redirect("/profile")
            });
        });
         
    }
})

app.post("/login", async (req,res)=>{
    const {email, password} = req.body
    const user = await userModel.findOne({email: email})
    console.log(user);
    
    bcrypt.compare(password, user.password, function(err, result) {
        if (result){
            let token =jwt.sign({email: email, _id: user._id}, "secret_key")
            res.cookie("token", token)
            res.redirect("/profile")
        }
        else{
            res.send("something went wrong")
        }
    });
})

app.post("/update/profile", isLoggedIn, upload.single("uploaded_file"), async (req,res)=>{
    let user = await userModel.findOneAndUpdate({_id: req.user._id}, {profile: req.file.filename})
    await user.save()
    res.redirect("/profile")
})

app.post("/create/post", isLoggedIn, async (req,res)=>{
    const {content}= req.body
    let user =await userModel.findOne({_id: req.user._id})
    let post = await postModel.create({
        content: content,
        user: req.user._id
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

app.get("/like/:id", isLoggedIn, async(req,res)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate('user')

    if (post.likes.indexOf(req.user._id) === -1){
        post.likes.push(req.user._id)
    }else{
        post.likes.splice(post.likes.indexOf(req.user._id),1)
    }
    await post.save()
    res.redirect("/profile")
})

app.get("/edit/:id", isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.id})
    res.render("edit",{post: post})
})

app.post("/update/:id", isLoggedIn, async(req,res)=>{
    let {content}= req.body
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: content})
    await post.save()
    res.redirect("/profile")
})

// custom middleware
function isLoggedIn(req, res, next){
    if (req.cookies.token == ""){
        res.status(500).send("user must be logged in")
    }
    else{
        let data = jwt.verify(req.cookies.token, "secret_key")
        req.user = data
        next();
    }
}

module.exports = app