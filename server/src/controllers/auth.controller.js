import User from "../models/user.model.js";
import Company from "../models/company.model.js"
import { hashPassword, generateAccessToken, generateRefreshToken, comparePassword, setRefreshCookie, hashToken, verifyRefreshToken } from "../utils/jwt.utils.js";


export const register = async (req, res) => {
    
    const { name, email, password } = req.body;
    const companyName = req.body.company;

    if (!email || !password || !name || !companyName) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }


    const normalizedEmail = email.toLowerCase().trim();

    const isUserExist = await User.findOne({ email: normalizedEmail })

    if (isUserExist) {
        return res.status(400).json({ message: "User already exists" });
    }

    const slug = companyName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    if (await Company.findOne({ slug })) {
        return res.status(400).json({ message: "Company name already taken" });
    }

    const company = await Company.create({ name: companyName, slug });


    try {
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: await hashPassword(password),
            role: "admin",             
            companyId: company._id,
        });
        company.createdBy = user._id;
        await company.save();

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);
        user.refreshToken = await hashToken(refreshToken);
        await user.save();

        setRefreshCookie(res, refreshToken);

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        return res.status(201).json({ success: true, message: "Registered successfully", userResponse, accessToken });
    } catch (err) {
        await Company.findByIdAndDelete(company._id); 
        throw err;
    }
}

export const createCompanyUser = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    if (!["recruiter", "hiring_manager"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const normalizedEmail = email?.toLowerCase().trim();
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await hashPassword(password),
      role,
      companyId: req.user.companyId,   
    });
  
    return res.status(201).json({ success: true, user: { _id: user._id, name, email: normalizedEmail, role } });
  };

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    
    const normalizedEmail= email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail }).select("+password")

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await comparePassword(password, user.password)

    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
        return res.status(403).json({ message: "Account disabled" });
      }

    const accessToken = await generateAccessToken(user)
    const refreshToken = await generateRefreshToken(user)

    const hashedRefreshToken = await hashToken(refreshToken)

    user.refreshToken = hashedRefreshToken
    await user.save()

    setRefreshCookie(res, refreshToken)
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.refreshToken

    return res.status(200).json({ success: true, message: "user logged in successfully", userResponse, accessToken })

}

export const getMe = async (req, res) => {
    const company = await Company.findById(req.user.companyId).select("name").lean()
    const user = { ...req.user.toObject(), company: company?.name }
    return res.status(200).json({ success: true, message: "user fetched successfully", user })
}

export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken

    if (!token) {
        return res.status(401).json({ message: "Refresh token not found." })
    }

    try {
        const decoded = verifyRefreshToken(token)

        const user = await User.findById(decoded._id).select("+refreshToken")

        if (!user || !user.refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" })
        }

        const isValid = user.refreshToken === await hashToken(token)

        if (!isValid) {
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

    } catch (error) {
        return res.status(401).json({ message: "Refresh token expired, please login again" })
    }
}


export const logout = async (req, res) => {
    const user = req.user

    user.refreshToken = null
    await user.save()

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })

    return res.status(200).json({ success: true, message: "user logged out successfully" })
}

export const listCompanyUsers = async (req, res) => {
    const users = await User.find({ companyId: req.user.companyId })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean()
    return res.status(200).json({ success: true, users })
  }