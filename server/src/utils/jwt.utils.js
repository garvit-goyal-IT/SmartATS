import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const hashPassword= async(password)=>{
    return bcrypt.hash(password,10)
}

export const comparePassword= async(currPass, hashedPass)=>{
    return bcrypt.compare(currPass,hashedPass)
}

export const generateAccessToken= async (userId)=>{
   return jwt.sign({_id : userId}, 
                process.env.ACCESS_TOKEN_SECRET_KEY, 
                {expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"}
            )
}

export const generateRefreshToken=async (userId)=>{
    return jwt.sign({_id : userId}, 
                 process.env.REFRESH_TOKEN_SECRET_KEY, 
                 {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"}
             )
 }

 export const verifyAccessToken = (token)=> jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY)
 export const verifyRefreshoken = (token)=> jwt.verify(token,process.env.REFRESH_TOKEN_SECRET_KEY)

 export const hashToken= async (token)=>{
    if(!token) throw new Error("token is missing")

    return bcrypt.hash(token,10)
 }  

 export const setRefreshCookie =(res,token)=>{
    res.cookie("refreshToken", token, {
        httpOnly : true,
        secure: process.env.NODE_ENV=== "production",
        sameSite: "strict",
        maxAge: 7*24*60*60*1000
    })
 }