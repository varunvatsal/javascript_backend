// require('dotenv').config({path: "./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config({
    path: "./env"
})

connectDB()//async methods returns a promise
.then(()=>{
    try{
        app.on("error", (error)=>{
            console.log("error: ", error)
            throw error
        })
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`server is running at port:${process.env.port||8000}`)
        })
    } catch(err){
        console.log(`ERROR: ${err}`)
        throw err
    }
    
})
.catch((err)=>{
    console.log("MONGO db connection failed !!", err)
})





















/*
import express from "express"
const app = express()
;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("error: ", error)
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`application is listening on PORT: ${process.env.PORT}`)
        })
    } catch(err){
        console.log(`ERROR: ${err}`)
        throw err
    }
})() //this is a iife immedite execution of a function, always start with a semicolon to avoid trouble from editer
*/