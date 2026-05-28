import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"


const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/jobs", label: "Jobs", icon: "💼" },
    { path: "/candidates", label: "Candidates", icon: "👥" },
    { path: "/pipeline", label: "Pipeline", icon: "🔄" },
    { path: "/interviews", label: "Interviews", icon: "📅" },
]
const premiumItems = [
    { path: "/compare", label: "Compare", icon: "⚖️" },
    { path: "/bulk-upload", label: "Bulk Upload", icon: "📤" },
]

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        toast.success("Logged out")
        navigate("/login")
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            {/* Sidebar */}
            <div style={{
                width: collapsed ? "72px" : "260px",
                background: "#0f172a",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.2s ease",
                flexShrink: 0,
                position: "fixed",
                top: 0, left: 0, bottom: 0,
                zIndex: 100,
                overflowX: "hidden"
            }}>
                {/* Logo */}
                <div style={{
                    padding: collapsed ? "24px 16px" : "24px 24px",
                    borderBottom: "1px solid #1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: "72px"
                }}>
                    {!collapsed && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                                width: "38px", height: "38px",
                                background: "#6366f1", borderRadius: "10px",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", color: "white",
                                fontWeight: "bold", fontSize: "16px", flexShrink: 0
                            }}>T</div>
                            <div>
                                <div style={{ color: "white", fontWeight: "700", fontSize: "20px" }}>TalentFlow AI</div>
                                <div style={{ color: "#6366f1", fontSize: "14px" }}>Smart ATS Suite</div>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div style={{
                            width: "36px", height: "36px",
                            background: "#6366f1", borderRadius: "10px",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", color: "white",
                            fontWeight: "bold", fontSize: "16px"
                        }}>T</div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            background: "none", border: "none",
                            color: "#64748b", cursor: "pointer",
                            fontSize: "18px", padding: "4px",
                            marginLeft: collapsed ? "auto" : "0",
                            display: "flex", alignItems: "center"
                        }}
                    >
                        {collapsed ? "→" : "←"}
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: collapsed ? "12px" : "12px 16px",
                                borderRadius: "10px",
                                textDecoration: "none",
                                color: isActive ? "white" : "#94a3b8",
                                background: isActive ? "#6366f1" : "transparent",
                                fontWeight: isActive ? "600" : "400",
                                fontSize: "16px",
                                transition: "all 0.15s ease",
                                justifyContent: collapsed ? "center" : "flex-start"
                            })}
                        >
                            <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>
                {/* Premium nav items */}
                {!collapsed && (
                    <div style={{ padding: "8px 12px" }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#334155", letterSpacing: "0.1em", marginBottom: "8px", paddingLeft: "4px" }}>
                            PREMIUM
                        </div>
                    </div>
                )}
                {premiumItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: collapsed ? "12px" : "12px 16px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            color: isActive ? "white" : "#94a3b8",
                            background: isActive ? "#f59e0b" : "transparent",
                            fontWeight: isActive ? "600" : "400",
                            fontSize: "14px",
                            transition: "all 0.15s ease",
                            justifyContent: collapsed ? "center" : "flex-start",
                            position: "relative"
                        })}
                    >
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                        {!collapsed && (
                            <span style={{ flex: 1 }}>{item.label}</span>
                        )}
                        {!collapsed && (
                            <span style={{
                                fontSize: "9px", fontWeight: "700",
                                background: "#f59e0b", color: "white",
                                padding: "2px 6px", borderRadius: "6px"
                            }}>PRO</span>
                        )}
                    </NavLink>
                ))}

                {/* User section */}
                <div style={{
                    padding: "16px 12px",
                    borderTop: "1px solid #1e293b"
                }}>
                    {!collapsed && (
                        <div style={{
                            padding: "12px 16px",
                            background: "#1e293b",
                            borderRadius: "10px",
                            marginBottom: "8px"
                        }}>
                            <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
                                {user?.name}
                            </div>
                            <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                                {user?.role?.replace("_", " ")}
                            </div>
                        </div>
                    )}
                    {/* Premium upgrade banner */}
                    {!collapsed && (
                        <div style={{
                            margin: "0 12px 12px",
                            padding: "16px",
                            background: "linear-gradient(135deg, #f59e0b, #f97316)",
                            borderRadius: "12px",
                            cursor: "pointer"
                        }} onClick={() => navigate("/premium")}>
                            <div style={{ color: "white", fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
                                ⚡ Upgrade to Premium
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px" }}>
                                AI question generator, bulk upload & more
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: collapsed ? "12px" : "10px 16px",
                            background: "none",
                            border: "1px solid #1e293b",
                            borderRadius: "10px",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: collapsed ? "center" : "flex-start",
                            gap: "8px"
                        }}
                    >
                        <span>🚪</span>
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{
                marginLeft: collapsed ? "72px" : "260px",
                flex: 1,
                transition: "margin-left 0.2s ease",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh"
            }}>
                {/* Top navbar */}
                <div style={{
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "0 32px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 50
                }}>
                    <div style={{ color: "#0f172a", fontWeight: "600", fontSize: "16px" }}>
                        Smart ATS Hiring Suite
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            margin: "0 5px 5px",
                            padding: "10px",
                            background: "linear-gradient(135deg, #f59e0b, #f97316)",
                            borderRadius: "20px",
                            cursor: "pointer"
                        }} onClick={() => navigate("/premium")}>
                            <div style={{ color: "white", fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>
                                Premium
                            </div>
                        </div>
                        <div style={{
                            padding: "6px 12px",
                            background: "#eef2ff",
                            borderRadius: "20px",
                            color: "#6366f1",
                            fontSize: "12px",
                            fontWeight: "600"
                        }}>
                            {user?.company}
                        </div>
                        <div style={{
                            width: "36px", height: "36px",
                            background: "#6366f1",
                            borderRadius: "50%",
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            color: "white", fontWeight: "700",
                            fontSize: "14px"
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ flex: 1, padding: "32px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout