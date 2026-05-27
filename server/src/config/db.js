import mongoose from "mongoose";

export const connectToDb= async function(){

    await mongoose.connect(process.env.MONGO_URI)
    console.log("connected to Database")

    mongoose.connection.on('error', (err) => {
        console.log("MongoDB connection error:", err)
    })
    mongoose.connection.on('disconnected', () => {
        console.log("MongoDB disconnected")
    })

}