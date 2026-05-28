import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function VersionSwitcher() {
    const navigate = useNavigate()
    const { user, isPremium } = useAuth()

    if (!user) return null

    return (
        <div style={{
            display: "flex",
            gap: 8,
            alignItems: "center"
        }}>
            {!isPremium ? (
                // Regular user - show Premium upgrade button
                <>
                    <span style={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 500
                    }}>
                        ✨ Upgrade to Premium
                    </span>
                    <button
                        onClick={() => navigate("/premium")}
                        style={{
                            background: "linear-gradient(135deg, #F5C842, #E8A000)",
                            color: "#0A0800",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "opacity 0.2s"
                        }}
                        onMouseEnter={e => e.target.style.opacity = "0.9"}
                        onMouseLeave={e => e.target.style.opacity = "1"}
                    >
                        Go Premium
                    </button>
                </>
            ) : (
                // Premium user - show back to regular button
                <>
                    <span style={{
                        fontSize: 13,
                        color: "#F5C842",
                        fontWeight: 700
                    }}>
                        ⭐ Premium Active
                    </span>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "transparent",
                            color: "#64748b",
                            border: "1px solid #E2E8F0",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = "#94A3B8"
                            e.target.style.color = "#0F172A"
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = "#E2E8F0"
                            e.target.style.color = "#64748b"
                        }}
                    >
                        Back to Regular
                    </button>
                </>
            )}
        </div>
    )
}