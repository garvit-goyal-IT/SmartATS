import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../api/index"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("accessToken")
                if (!token) {
                    setLoading(false)
                    return
                }
                
                // Verify token is still valid
                const res = await authAPI.me()
                const userData = res.data.user || res.data
                
                setUser({
                    ...userData,
                    // Check if user is premium (adjust based on your backend response)
                    isPremium: userData.isPremium || userData.tier === "premium" || false
                })
            } catch (err) {
                console.error("Auth check failed:", err)
                localStorage.removeItem("accessToken")
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email, password, isPremium = false) => {
        try {
            const res = await authAPI.login({ email, password })
            const token = res.data.token || res.data.accessToken
            const userData = res.data.user || res.data
            
            localStorage.setItem("accessToken", token)
            
            const userWithTier = {
                ...userData,
                isPremium: isPremium || userData.isPremium || false
            }
            
            setUser(userWithTier)
            return userWithTier
        } catch (err) {
            throw err
        }
    }

    const register = async (data, isPremium = false) => {
        try {
            const res = await authAPI.register(data)
            const token = res.data.token || res.data.accessToken
            const userData = res.data.user || res.data
            
            localStorage.setItem("accessToken", token)
            
            const userWithTier = {
                ...userData,
                isPremium: isPremium || userData.isPremium || false
            }
            
            setUser(userWithTier)
            return userWithTier
        } catch (err) {
            throw err
        }
    }

    const logout = () => {
        localStorage.removeItem("accessToken")
        setUser(null)
    }

    const upgradeToPremium = () => {
        if (user) {
            setUser({ ...user, isPremium: true })
        }
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        upgradeToPremium,
        isPremium: user?.isPremium || false
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}