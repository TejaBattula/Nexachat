require("dotenv").config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const {clerkMiddleware} = require("@clerk/express")
const fs = require("fs")
const path = require("path")
const {verifyWebhook} = require("@clerk/backend/webhooks")
const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL

const publicDir = path.join(__dirname, "../frontend/dist")
// app.use("/api/webhooks/clerk",express.raw({type : "application/json"}),clerkWebhook)
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
    fullName : {
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
app.post("/api/webhooks/clerk",async(req,res)=>{
    try {
        const signinSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
        if(!signinSecret){
            res.status(503).json({
                message : "Webhook secret is not provided!"
                
            })
            return
        }
        const payload = Buffer.isBuffer(req.body)?req.body.toString("utf8"):String(req.body)
        const request = new Request("http://internal/webhooks/clerk",{
            method : "POST",
            headers : new Headers(req.headers),
            body : payload
        })

        const evt = await verifyWebhook(request,{signinSecret})

        if(evt.type === "user.created"||evt.type === "user.updated"){
            const u=evt.data
            const email = 
            u.email_addresses?.find((e)=>e.id === u.primary_email_address_id)?.email_address??
            u.email_addresses?.[0]?.email_address

            const fullName =
            [u.first_name,u.last_name].filter(Boolean).join(" ")||u.username || email?.split("@")[0];

            await User.findOneAndUpdate(
                {clerkId:u.id},
                {clerkId:u.id,email,fullName,profilepic : u.image_url}
            )
        }
        if(evt.type === "user.deleted"){
            if(evt.data.id) await User.findOneAndDelete({clerkId : evt.data.id})
        }
    
        res.status(200).json({received : true})
    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            message : "Webhook verification failed"
        })
    }
})
app.get("/health", (req, res) => {
    res.status(200).send("NexaChat backend is running");
});
app.get("/",(req,res)=>{
    res.send("hi i am nexchat backend");
    
})
const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server run on port number ${PORT}!`);
})