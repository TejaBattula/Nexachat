require("dotenv").config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const app = express()
app.use(cors())
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connect!");
    
})
.catch(()=>{
    console.log("Failed to connect Database!");
    
})

app.get("/",(req,res)=>{
    res.send("hi i am nexchat backend");
    
})
app.listen(3000,()=>{
    console.log("Server run on port number 3000!");
    
})