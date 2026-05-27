import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";

export const protect= async (req,res,next)=>{
    const authHeader= req.headers.authorization

    if(!authHeader?.startsWith("Bearer")){
        return res.status(401).json({
            message: "Not Authenticated"
        })
    }   
 
    const token= authHeader.split(" ")[1]

    try {
        const decoded= verifyAccessToken(token)
    
        const user= await User.findById(decoded._id)
        if(!user){
            return res.status(401).json({
                message: "user no longer exist"
            })
        }
        req.user= user
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}

export const authorizeRole = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message: "You are not authorized to access this resource"
            })
        }
        next()
    }
}