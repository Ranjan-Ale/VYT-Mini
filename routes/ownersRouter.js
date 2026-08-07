const express = require("express")
const router = express.Router()
const ownerModel = require("../models/owner-model")

router.get("/", (req, res)=>{
    res.send("hello owner")
})

if (process.env.NODE_ENV === "development"){
    router.post("/create", async function (req,res){
        const owners = await ownerModel.find()
        if(owners.length > 0){
            res.status(503).send("You don't have privilege to create owner")
        }
        else{
            const {fullname, email, password} = req.body
            let ownerCreated = await ownerModel.create({
                fullname: fullname,
                email: email,
                password: password
            })
            res.send(ownerCreated)
        }
    })
}

module.exports = router