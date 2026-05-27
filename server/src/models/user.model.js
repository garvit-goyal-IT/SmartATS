import mongoose from "mongoose";


const userSchema= new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["admin", "recruiter", "hiring_manager"],
        default: "recruiter"
    },
    company: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const userModel= mongoose.model('user',  userSchema)

export default userModel