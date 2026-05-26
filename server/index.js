import express from 'express'
import { configDotenv } from 'dotenv'
import { connectToDb } from './src/config/db.js'
import cors from "cors"

configDotenv()

const app= express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.get('/health', (req,res)=>{
    return res.json({status: "ok"})
})

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




