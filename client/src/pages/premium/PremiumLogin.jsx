import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"

const PremiumLogin = () => {
    const [email,    setEmail]    = useState("")
    const [password, setPassword] = useState("")
    const [loading,  setLoading]  = useState(false)
    const { login }               = useAuth()
    const navigate                = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!email || !password) return toast.error("Please fill all fields")
        setLoading(true)
        try {
            await login(email, password)
            toast.success("Welcome to TalentFlow Premium!")
            navigate("/premium/app")
        } catch(err) {
            toast.error(err.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: "flex", minHeight: "100vh",
            background: "#0a0a0a",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Left Panel */}
            <div style={{
                width: "50%", display: "flex",
                flexDirection: "column", justifyContent: "space-between",
                padding: "48px 64px", borderRight: "1px solid #1a1a1a"
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "44px", height: "44px",
                        background: "linear-gradient(135deg, #f59e0b, #f97316)",
                        borderRadius: "12px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "20px", fontWeight: "bold", color: "white"
                    }}>⚡</div>
                    <div>
                        <div style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>
                            TalentFlow AI
                        </div>
                        <div style={{ color: "#f59e0b", fontSize: "12px" }}>
                            Premium Suite
                        </div>
                    </div>
                </div>

                {/* Center content */}
                <div>
                    <div style={{
                        display: "inline-block", padding: "6px 16px",
                        background: "#1a1a1a", border: "1px solid #f59e0b",
                        borderRadius: "20px", marginBottom: "32px"
                    }}>
                        <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "700" }}>
                            ⚡ PREMIUM ACCESS
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: "52px", fontWeight: "900",
                        lineHeight: "1.1", marginBottom: "24px"
                    }}>
                        <span style={{ color: "white" }}>Hire Smarter</span><br />
                        <span style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            with AI
                        </span>
                    </h1>

                    <p style={{ color: "#606060", fontSize: "17px", lineHeight: "1.7", marginBottom: "48px" }}>
                        Access all premium features — AI interview questions, candidate comparison, bulk uploads, and advanced analytics.
                    </p>

                    {/* Premium features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { icon: "⚡", text: "AI Interview Question Generator" },
                            { icon: "⚖️", text: "Candidate Comparison Tool" },
                            { icon: "📤", text: "Bulk Resume Upload" },
                            { icon: "📊", text: "Advanced Analytics Dashboard" },
                        ].map(f => (
                            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px", height: "36px",
                                    background: "#1a1a1a", borderRadius: "10px",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: "18px",
                                    border: "1px solid #2a2a2a", flexShrink: 0
                                }}>{f.icon}</div>
                                <span style={{ color: "#a0a0a0", fontSize: "14px" }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ color: "#333", fontSize: "13px" }}>
                    © 2026 TalentFlow AI — Premium Suite
                </p>
            </div>

            {/* Right Panel */}
            <div style={{
                width: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                padding: "48px 64px"
            }}>
                <div style={{ width: "100%", maxWidth: "440px" }}>
                    <div style={{ marginBottom: "48px" }}>
                        <h2 style={{ fontSize: "36px", fontWeight: "800", color: "white", marginBottom: "8px" }}>
                            Welcome back
                        </h2>
                        <p style={{ color: "#606060", fontSize: "16px" }}>
                            Sign in to your Premium account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#a0a0a0", marginBottom: "8px" }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    background: "#111111",
                                    border: "1.5px solid #2a2a2a",
                                    borderRadius: "12px", fontSize: "15px",
                                    outline: "none", color: "white",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "32px" }}>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#a0a0a0", marginBottom: "8px" }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    background: "#111111",
                                    border: "1.5px solid #2a2a2a",
                                    borderRadius: "12px", fontSize: "15px",
                                    outline: "none", color: "white",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "16px",
                                background: loading
                                    ? "#92400e"
                                    : "linear-gradient(135deg, #f59e0b, #f97316)",
                                color: "white", border: "none",
                                borderRadius: "12px", fontSize: "16px",
                                fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                                marginBottom: "16px"
                            }}
                        >
                            {loading ? "Signing in..." : "Access Premium →"}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div style={{
                        padding: "16px 20px", background: "#111111",
                        borderRadius: "12px", border: "1px solid #2a2a2a",
                        marginBottom: "24px"
                    }}>
                        <p style={{ fontSize: "12px", fontWeight: "600", color: "#606060", marginBottom: "8px" }}>
                            Demo credentials
                        </p>
                        <p style={{ fontSize: "13px", color: "#a0a0a0", marginBottom: "4px" }}>
                            Email: <span style={{ fontFamily: "monospace", color: "#f59e0b" }}>admin@test.com</span>
                        </p>
                        <p style={{ fontSize: "13px", color: "#a0a0a0" }}>
                            Password: <span style={{ fontFamily: "monospace", color: "#f59e0b" }}>password123</span>
                        </p>
                    </div>

                    <p style={{ textAlign: "center", fontSize: "14px", color: "#606060" }}>
                        Want the free version?{" "}
                        <Link to="/login" style={{ color: "#f59e0b", fontWeight: "700" }}>
                            Standard login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default PremiumLogin