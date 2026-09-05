require("dotenv").config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const {clerkMiddleware} = require("@clerk/express")
const fs = require("fs")
const path = require("path")

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL

const publicDir = path.join(__dirname, "../frontend/dist")

app.use(express.json())
app.use(cors({
    origin : FRONTEND_URL,credentials : true
}))
app.use(clerkMiddleware())

///////MONGODB CONNECTION///////

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connect!");
    
})
.catch(()=>{
    console.log("Failed to connect Database!");
    
})

///////////////////SCHEMAS///////////////////////
/////////////////////////////////////////////////


const userSchema = new mongoose.Schema({
    clerkId : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    fullname : {
        type : String,
        required : true
    },
    profilepic : {
        type : String,
        default : ""
    }
},{timestamps : true})
const messageSchema = new mongoose.Schema({
    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    text : {
        type : String
    },
    image : {
        type : String
    },
    video   : {
        type : String
    }
},{timestamps : true})
const User = mongoose.model("User",userSchema)
const Message = mongoose.model("Message",messageSchema)

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))
    app.get("/{*any}",(req,res,next)=>{
        res.sendFile(path.join(publicDir,"index.html"),(err)=>next(err))
    })
}

app.get("/",(req,res)=>{
    res.send("hi i am nexchat backend");
    
})
const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server run on port number ${PORT}!`);
})