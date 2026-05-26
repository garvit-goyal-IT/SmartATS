import mongoose from "mongoose";

const candidateSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    resume: {
        type: String,
    }
},{
    timestamps: true
})

const candidateModel= mongoose.model("candidate", candidateSchema)

export default candidateModel