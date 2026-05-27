import User from "../models/user.model.js";
import {hashPassword,generateAccessToken,generateRefreshToken,comparePassword,setRefreshCookie, hashToken,verifyRefreshToken} from "../utils/jwt.utils.js";


export const register = async (req, res) => {
    const {name,email,password,company,role}= req.body;  

    if(!email || !password || !name || !company){
        return res.status(400).json({message:"Please provide all required fields"});
    }
    
    const isUserExist= await User.findOne({email})

    if(isUserExist) {
        return res.status(400).json({message:"User already exists"});
    }

    const hashedPassword= await hashPassword(password)

    const user = await User.create({name,email,password:hashedPassword,company,role})

    const accessToken= await generateAccessToken(user)
    const refreshToken= await generateRefreshToken(user)

    const hashedRefreshToken= await hashToken(refreshToken)
    user.refreshToken= hashedRefreshToken
    await user.save()

    setRefreshCookie(res,refreshToken)

    return res.status(201).json({success: true, message: "user registered successfully", user , accessToken})
}

export const login = async (req, res) => {  
    const {email,password}= req.body;

    if(!email || !password){
        return res.status(400).json({message:"Please provide all required fields"});
    }
    
    const user= await User.findOne({email}).select("+password") 

    if(!user){
        return res.status(400).json({message:"Invalid credentials"});
    }

    const isPasswordMatch= await comparePassword(password,user.password)

    if(!isPasswordMatch){
        return res.status(400).json({message:"Invalid credentials"});
    }

    user.password=undefined

    const accessToken= await generateAccessToken(user)
    const refreshToken= await generateRefreshToken(user)

    const hashedRefreshToken= await hashToken(refreshToken)

    user.refreshToken= hashedRefreshToken
    await user.save()

    setRefreshCookie(res,refreshToken)

    return res.status(200).json({success: true, message: "user logged in successfully", user , accessToken})

}

export const getMe= async (req,res)=>{
    const user= req.user

    return res.status(200).json({success: true, message: "user fetched successfully", user})
}   

export const refreshToken= async(req,res)=>{
    const token= req.cookies.refreshToken

    if(!token){
        return res.status(401).json({message:"Refresh token not found."})
    }

    try {
        const decoded = verifyRefreshToken(token)

        const user = await User.findById(decoded._id).select("+refreshToken")

        if(!user || !user.refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" })
        }

        const isValid = await comparePassword(token, user.refreshToken)

        if(!isValid) {
            user.refreshToken = null
            await user.save()
            return res.status(401).json({ message: "Token reuse detected. Please login again." })
        }

        const newAccessToken = await generateAccessToken(user)
        const newRefreshToken = await generateRefreshToken(user)

        user.refreshToken = await hashToken(newRefreshToken)
        await user.save()

        setRefreshCookie(res, newRefreshToken)

        return res.status(200).json({ 
            success: true, 
            accessToken: newAccessToken 
        })

    } catch(error) {
        return res.status(401).json({ message: "Refresh token expired, please login again" })
    }
}


export const logout= async (req,res)=>{ 
    const user= req.user

    user.refreshToken= null
    await user.save()

    res.clearCookie("refreshToken")

    return res.status(200).json({success: true, message: "user logged out successfully"})
}