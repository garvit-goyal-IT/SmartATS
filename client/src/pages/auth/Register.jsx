import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"

const Register = () => {
    const [form, setForm]       = useState({ name: "", email: "", password: "", company: "", role: "recruiter" })
    const [loading, setLoading] = useState(false)
    const { register }          = useAuth()
    const navigate              = useNavigate()

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!form.name || !form.email || !form.password || !form.company) {
            return toast.error("Please fill all fields")
        }
        setLoading(true)
        try {
            await register(form)
            toast.success("Welcome to TalentFlow AI!")
            navigate("/")
        } catch(err) {
            toast.error(err.response?.data?.message || "Registration failed")
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
                        background: "#6366f1", borderRadius: "12px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "20px",
                        fontWeight: "bold", color: "white"
                    }}>T</div>
                    <div>
                        <div style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>TalentFlow AI</div>
                        <div style={{ color: "#818cf8", fontSize: "12px" }}>Smart ATS Hiring Suite</div>
                    </div>
                </div>

                {/* Middle content */}
                <div>
                    <h1 style={{
                        fontSize: "48px", fontWeight: "800",
                        color: "white", lineHeight: "1.15",
                        marginBottom: "24px"
                    }}>
                        AI-Powered Hiring.<br />
                        Smarter Decisions.<br />
                        Better Teams.
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "17px", lineHeight: "1.7", marginBottom: "40px" }}>
                        Find the best talent faster with our AI-driven recruitment platform.
                    </p>

                    {/* Early access badge */}
                    <div style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "16px",
                        padding: "20px 24px",
                        marginBottom: "40px"
                    }}>
                        <div style={{ color: "#818cf8", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                            🎯 Limited Early Access Available
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
                            Join 500+ companies already using TalentFlow AI to build better teams faster.
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "32px", paddingTop: "40px",
                        borderTop: "1px solid #1e293b"
                    }}>
                        {[
                            { value: "500+", label: "Companies" },
                            { value: "50k+", label: "Hires Made" },
                            { value: "4.9★", label: "Rating" }
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: "32px", fontWeight: "800", color: "#818cf8" }}>{s.value}</div>
                                <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ color: "#334155", fontSize: "13px" }}>
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
                    <div style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                            Create your account
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "16px" }}>
                            Start Hiring Today — it's completely free
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {[
                            { label: "Full name",    name: "name",     type: "text",     placeholder: "John Doe" },
                            { label: "Work email",   name: "email",    type: "email",    placeholder: "you@company.com" },
                            { label: "Password",     name: "password", type: "password", placeholder: "Min. 8 characters" },
                            { label: "Company name", name: "company",  type: "text",     placeholder: "Acme Inc." },
                        ].map(field => (
                            <div key={field.name} style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block", fontSize: "14px",
                                    fontWeight: "600", color: "#374151",
                                    marginBottom: "8px"
                                }}>
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    style={{
                                        width: "100%", padding: "14px 16px",
                                        border: "1.5px solid #e2e8f0",
                                        borderRadius: "12px", fontSize: "15px",
                                        outline: "none", boxSizing: "border-box",
                                        color: "#0f172a"
                                    }}
                                />
                            </div>
                        ))}

                        <div style={{ marginBottom: "28px" }}>
                            <label style={{
                                display: "block", fontSize: "14px",
                                fontWeight: "600", color: "#374151",
                                marginBottom: "8px"
                            }}>
                                Your role
                            </label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    border: "1.5px solid #e2e8f0",
                                    borderRadius: "12px", fontSize: "15px",
                                    outline: "none", boxSizing: "border-box",
                                    background: "white", color: "#0f172a",
                                    cursor: "pointer"
                                }}
                            >
                                <option value="recruiter">Recruiter</option>
                                <option value="hiring_manager">Hiring Manager</option>
                                <option value="admin">Admin</option>
                            </select>
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
                                marginBottom: "24px"
                            }}
                        >
                            {loading ? "Creating account..." : "Start Hiring Today →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#6366f1", fontWeight: "700" }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register