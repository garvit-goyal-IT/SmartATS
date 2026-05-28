import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"

const navItems = [
  { path: "/premium/app", label: "Dashboard", icon: "📊", end: true },
]

const premiumItems = [
  { path: "/premium/app/resume-analysis", label: "Resume Analysis", icon: "📄" },
  { path: "/premium/app/ai-matching",     label: "AI Matching",     icon: "🧠" },
]

const PremiumLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out")
    navigate("/premium")
  }

  const linkStyle = (isActive, isPremium = false) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: collapsed ? "12px" : "12px 16px",
    borderRadius: "12px",
    textDecoration: "none",
    color: isActive ? (isPremium ? "#0a0a0a" : "#fff") : "#8a8a8a",
    background: isActive
      ? isPremium
        ? "linear-gradient(135deg, #fbbf24, #f97316)"
        : "linear-gradient(135deg, #1a1a1a, #141414)"
      : "transparent",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
    transition: "all 0.2s ease",
    justifyContent: collapsed ? "center" : "flex-start",
    border: isActive
      ? isPremium
        ? "1px solid rgba(251,191,36,0.5)"
        : "1px solid #2a2a2a"
      : "1px solid transparent",
    boxShadow: isActive && isPremium ? "0 8px 24px -8px rgba(249,115,22,0.6)" : "none",
  })

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#070707" }}>
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "76px" : "264px",
          background: "linear-gradient(180deg, #0c0c0c 0%, #080808 100%)",
          borderRight: "1px solid #161616",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflowX: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "24px 16px" : "24px",
            borderBottom: "1px solid #161616",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "72px",
          }}
        >
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  background: "linear-gradient(135deg, #fbbf24, #f97316)",
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px",
                  flexShrink: 0,
                  boxShadow: "0 8px 20px -6px rgba(249,115,22,0.6)",
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: "14px", letterSpacing: "0.2px" }}>
                  TalentFlow AI
                </div>
                <div style={{ color: "#fbbf24", fontSize: "10px", letterSpacing: "0.08em", fontWeight: 600 }}>
                  PREMIUM SUITE
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #fbbf24, #f97316)",
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                boxShadow: "0 8px 20px -6px rgba(249,115,22,0.6)",
              }}
            >
              ⚡
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#707070",
              cursor: "pointer",
              fontSize: "18px",
              padding: "4px",
              marginLeft: collapsed ? "auto" : "0",
            }}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            overflowY: "auto",
          }}
        >
          {!collapsed && (
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#5a5a5a",
                letterSpacing: "0.12em",
                padding: "4px 8px 8px",
              }}
            >
              OVERVIEW
            </div>
          )}

          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} style={({ isActive }) => linkStyle(isActive)}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Premium section */}
          {!collapsed ? (
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#fbbf24",
                letterSpacing: "0.12em",
                padding: "20px 8px 8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚡ PREMIUM TOOLS</span>
            </div>
          ) : (
            <div style={{ height: "20px" }} />
          )}

          {premiumItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => linkStyle(isActive, true)}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      background: "rgba(10,10,10,0.25)",
                      color: "#0a0a0a",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PRO
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #161616" }}>
          {!collapsed && (
            <div
              style={{
                padding: "12px 14px",
                background: "linear-gradient(135deg, #121212, #0d0d0d)",
                borderRadius: "12px",
                marginBottom: "8px",
                border: "1px solid rgba(251,191,36,0.15)",
              }}
            >
              <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: "#fbbf24", fontSize: "11px", marginTop: "2px", fontWeight: 600 }}>
                ⚡ Premium Member
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: collapsed ? "12px" : "10px 16px",
              background: "transparent",
              border: "1px solid #1f1f1f",
              borderRadius: "10px",
              color: "#909090",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "8px",
              transition: "all 0.15s ease",
            }}
          >
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          marginLeft: collapsed ? "76px" : "264px",
          flex: 1,
          transition: "margin-left 0.2s ease",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            background: "rgba(13,13,13,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #161616",
            padding: "0 32px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ color: "white", fontWeight: 600, fontSize: "16px", display: "flex", alignItems: "center" }}>
            Smart ATS Hiring Suite
            <span
              style={{
                marginLeft: "12px",
                fontSize: "10px",
                background: "linear-gradient(135deg, #fbbf24, #f97316)",
                color: "white",
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                boxShadow: "0 6px 16px -6px rgba(249,115,22,0.6)",
              }}
            >
              PREMIUM
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user?.company && (
              <div
                style={{
                  padding: "6px 14px",
                  background: "#111",
                  borderRadius: "20px",
                  color: "#fbbf24",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid rgba(251,191,36,0.2)",
                }}
              >
                {user.company}
              </div>
            )}
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #fbbf24, #f97316)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 6px 16px -6px rgba(249,115,22,0.6)",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "32px", background: "#070707" }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default PremiumLayout
