import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../api/index"

const AuthContext = createContext()

const normalizeUser = (userData, isPremium = false) => ({
    ...userData,
    isPremium: isPremium || userData.isPremium || userData.tier === "premium" || false,
})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("accessToken")
                if (!token) return

                const res = await authAPI.me()
                setUser(normalizeUser(res.data.user || res.data))
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

    // Shared by login and register: store the token, then load the full user
    const startSession = async (res, isPremium) => {
        const token = res.data.accessToken || res.data.token
        localStorage.setItem("accessToken", token)

        const me = await authAPI.me()
        const userWithTier = normalizeUser(me.data.user || me.data, isPremium)
        setUser(userWithTier)
        return userWithTier
    }

    const login = async (email, password, isPremium = false) => {
        const res = await authAPI.login({ email, password })
        return startSession(res, isPremium)
    }

    const register = async (data, isPremium = false) => {
        const res = await authAPI.register(data)
        return startSession(res, isPremium)
    }

    const logout = async () => {
        try {
            await authAPI.logout?.()   // clears the refresh token on the server and the cookie
        } catch {
            // ignore, we still log out locally
        }
        localStorage.removeItem("accessToken")
        setUser(null)
    }

    const upgradeToPremium = () => {
        if (user) setUser({ ...user, isPremium: true })
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        upgradeToPremium,
        isPremium: user?.isPremium || false,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}