require("dotenv").config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const {clerkMiddleware} = require("@clerk/express")
const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL
app.use(express.json())
app.use(cors({
    origin : FRONTEND_URL,credentials : true
}))
app.use(clerkMiddleware())
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


























app.get("/",(req,res)=>{
    res.send("hi i am nexchat backend");
    
})
app.listen(3000,()=>{
    console.log("Server run on port number 3000!");
    
})