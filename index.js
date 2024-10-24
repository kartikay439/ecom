import dotenv from 'dotenv'
import app from './app.js'

import express from 'express'
import connectDB from "./src/db/db.js";


//Enabling server to use dotenv's
dotenv.config({
    path:'./env'
})

connectDB().then(
    ()=>{
        app.listen(process.env.port || 8000,()=>{
    console.log(`Server is running at ${process.env.PORT}`);
        })
        app.on("error",(error)=>{
    console.log("Error ",error)
        })
    }
).catch(error=>
    console.log("connection failed to Mongo DB")
)
