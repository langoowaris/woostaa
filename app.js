const express = require('express')
const app = express()

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})
app.listen(80,(req,res)=>{
    console.log("application started at port 80")
})