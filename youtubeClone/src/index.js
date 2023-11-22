//require('dotenv').config({path: "./env"})
import dotenv from "dotenv"
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB()





















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