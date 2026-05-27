import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"

const Login = () => {
    const [email, setEmail]= useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!email || !password) return toast.error("Please fill all fields")
        setLoading(true)
        try {
            await login(email, password)
            navigate("/",{replace: true})
            toast.success("Welcome back!")
        } catch(err) {
            toast.error(err.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            
            {/* Left Panel */}
            <div style={{
                width: "50%",
                background: "#0f172a",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "48px 64px",
                minHeight: "100vh"
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "44px", height: "44px",
                        background: "#6366f1",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", fontWeight: "bold", color: "white"
                    }}>T</div>
                    <div>
                        <div style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>TalentFlow AI</div>
                        <div style={{ color: "#818cf8", fontSize: "12px" }}>Smart ATS Hiring Suite</div>
                    </div>
                </div>

                {/* Middle content */}
                <div>
                    <h1 style={{
                        fontSize: "52px", fontWeight: "800",
                        color: "white", lineHeight: "1.15",
                        marginBottom: "24px"
                    }}>
                        Hire Smarter<br />with AI
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "18px", lineHeight: "1.7", marginBottom: "40px" }}>
                        Transform your recruitment process with intelligent candidate matching, automated screening, and explainable AI recommendations.
                    </p>

                    {/* Features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
                        {[
                            "AI-powered resume parsing & scoring",
                            "Semantic candidate matching",
                            "Automated interview scheduling",
                            "Real-time recruitment analytics"
                        ].map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "24px", height: "24px", borderRadius: "50%",
                                    background: "#6366f1", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <span style={{ color: "#cbd5e1", fontSize: "15px" }}>{f}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "32px", paddingTop: "40px",
                        borderTop: "1px solid #1e293b"
                    }}>
                        {[
                            { value: "10x", label: "Faster Screening" },
                            { value: "95%", label: "Match Accuracy" },
                            { value: "60%", label: "Time Saved" }
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: "36px", fontWeight: "800", color: "#818cf8" }}>{s.value}</div>
                                <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ color: "#334155", fontSize: "14px" }}>
                    © 2026 TalentFlow AI — Smart ATS Hiring Suite
                </p>
            </div>

            {/* Right Panel */}
            <div style={{
                width: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 64px",
                minHeight: "100vh"
            }}>
                <div style={{ width: "100%", maxWidth: "440px" }}>
                    <div style={{ marginBottom: "48px" }}>
                        <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                            Welcome back
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "16px" }}>
                            Sign in to your Smart ATS account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                    fontSize: "15px", outline: "none",
                                    boxSizing: "border-box", color: "#0f172a"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "32px" }}>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                    fontSize: "15px", outline: "none",
                                    boxSizing: "border-box", color: "#0f172a"
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "16px",
                                background: loading ? "#a5b4fc" : "#6366f1",
                                color: "white", border: "none",
                                borderRadius: "12px", fontSize: "16px",
                                fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                                marginBottom: "16px", transition: "background-color 0.2s ease"
                            }}
                        >
                            {loading ? "Signing in..." : "Sign in to TalentFlow →"}
                        </button>
                    </form>


                    <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
                        Don't have an account?{" "}
                        <Link to="/register" style={{ color: "#6366f1", fontWeight: "700" }}>
                            Create one 
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login