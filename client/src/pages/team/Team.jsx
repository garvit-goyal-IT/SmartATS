import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"

const ROLE_STYLES = {
    admin:          { label: "Admin",          bg: "#eef2ff", color: "#6366f1" },
    hiring_manager: { label: "Hiring Manager", bg: "#dcfce7", color: "#16a34a" },
    recruiter:      { label: "Recruiter",      bg: "#e0f2fe", color: "#0284c7" },
}

const card = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
}

const label = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "6px",
}

const input = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
}

const initialForm = { name: "", email: "", password: "", role: "hiring_manager" }

const Team = () => {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const load = async () => {
        try {
            const { data } = await api.get("/auth/users")
            setUsers(data.users)
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load team")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    // Hooks are above, so this early return is safe
    if (user && user.role !== "admin") return <Navigate to="/" replace />

    const submit = async (e) => {
        e.preventDefault()
        if (form.password.length < 8) {
            return toast.error("Password must be at least 8 characters")
        }
        setSaving(true)
        try {
            await api.post("/auth/users", form)
            toast.success(`${form.name} added as ${ROLE_STYLES[form.role].label}`)
            setForm(initialForm)
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    const count = (role) => users.filter(u => u.role === role).length

    const stats = [
        { label: "Total members",   value: users.length,                color: "#6366f1" },
        { label: "Hiring managers", value: count("hiring_manager"),     color: "#16a34a" },
        { label: "Recruiters",      value: count("recruiter"),          color: "#0284c7" },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
                    Team
                </h1>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
                    Add hiring managers and recruiters to {user?.company || "your company"}
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
            }}>
                {stats.map(s => (
                    <div key={s.label} style={{ ...card, textAlign: "center", padding: "20px" }}>
                        <div style={{ fontSize: "32px", fontWeight: "700", color: s.color }}>
                            {s.value}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add member */}
            <form onSubmit={submit} style={{ ...card, marginBottom: "24px" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                    Add a team member
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                    They will log in with this email and password.
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px",
                }}>
                    <div>
                        <label style={label}>Full name</label>
                        <input style={input} required placeholder="Priya Sharma"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label style={label}>Work email</label>
                        <input style={input} type="email" required placeholder="priya@company.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                        <label style={label}>Temporary password</label>
                        <div style={{ position: "relative" }}>
                            <input style={{ ...input, paddingRight: "44px" }}
                                type={showPassword ? "text" : "password"}
                                required minLength={5} placeholder="At least 5 characters"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute", right: "8px", top: "50%",
                                    transform: "translateY(-50%)", background: "none",
                                    border: "none", cursor: "pointer", fontSize: "16px",
                                }}>
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={label}>Role</label>
                        <select style={input} value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="hiring_manager">Hiring Manager</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={saving}
                    style={{
                        background: "#6366f1", color: "white", border: "none",
                        borderRadius: "10px", padding: "11px 24px",
                        fontSize: "14px", fontWeight: "600",
                        cursor: saving ? "not-allowed" : "pointer",
                        opacity: saving ? 0.7 : 1,
                    }}>
                    {saving ? "Adding..." : "+ Add member"}
                </button>
            </form>

            {/* Members list */}
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div style={{
                    padding: "20px 24px", borderBottom: "1px solid #e2e8f0",
                    fontSize: "16px", fontWeight: "700", color: "#0f172a",
                }}>
                    Members
                </div>

                {loading ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                        Loading...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                        No team members yet
                    </div>
                ) : (
                    users.map((u, i) => {
                        const role = ROLE_STYLES[u.role] || ROLE_STYLES.recruiter
                        return (
                            <div key={u._id} style={{
                                display: "flex", alignItems: "center", gap: "14px",
                                padding: "16px 24px", flexWrap: "wrap",
                                borderBottom: i === users.length - 1 ? "none" : "1px solid #f1f5f9",
                            }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    background: "#6366f1", color: "white",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: "700", fontSize: "15px", flexShrink: 0,
                                }}>
                                    {u.name?.charAt(0).toUpperCase()}
                                </div>

                                <div style={{ flex: 1, minWidth: "180px" }}>
                                    <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                                        {u.name} {u._id === user?._id && (
                                            <span style={{ color: "#94a3b8", fontWeight: "400" }}>(you)</span>
                                        )}
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: "13px" }}>{u.email}</div>
                                </div>

                                <div style={{
                                    padding: "5px 12px", borderRadius: "20px",
                                    background: role.bg, color: role.color,
                                    fontSize: "12px", fontWeight: "600",
                                }}>
                                    {role.label}
                                </div>

                                <div style={{ color: "#94a3b8", fontSize: "12px", minWidth: "90px", textAlign: "right" }}>
                                    Joined {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric",
                                    })}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default Team