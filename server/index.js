import { createRequire } from "module"
const require = createRequire(import.meta.url)
const dotenv = require("dotenv")
dotenv.config()


import express from 'express'

import { connectToDb } from './src/config/db.js'
import cookieParser from 'cookie-parser'
import cors from "cors"
import authRoutes from './src/routes/auth.routes.js'
import jobRoutes from './src/routes/job.routes.js'
import candidateRoutes from './src/routes/candidate.routes.js'
import applicationRoutes from './src/routes/application.routes.js'
import interviewRoutes from './src/routes/interview.routes.js'

const app= express()

const allowedOrigins = [
    "http://localhost:5173",
    "https://smart-ats-omega.vercel.app"
  ];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())



app.get('/health', (req,res)=>{
    return res.json({status: "ok"})
})

app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/candidates", candidateRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/interviews", interviewRoutes)

const startServer= async ()=>{
    try{ 
    await connectToDb()
     app.listen(process.env.PORT,()=>{
        console.log("server connected to PORT", process.env.PORT)
     })
    }
   catch (error) {
    console.log("error connecting to server" , error);
  }
}

startServer()




