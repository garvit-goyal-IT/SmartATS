import { useNavigate } from "react-router-dom"

const PremiumGate = ({ feature }) => {
    const navigate = useNavigate()

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "60vh", textAlign: "center", padding: "48px"
        }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>⚡</div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                Premium Feature
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "8px", maxWidth: "400px" }}>
                {feature} is available on the Premium plan.
            </p>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "32px" }}>
                Upgrade to unlock AI Interview Questions, Candidate Comparison, Bulk Upload and more.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
                <button
                    onClick={() => navigate("/premium")}
                    style={{
                        padding: "14px 32px",
                        background: "linear-gradient(135deg, #f59e0b, #f97316)",
                        color: "white", border: "none",
                        borderRadius: "12px", fontSize: "15px",
                        fontWeight: "700", cursor: "pointer"
                    }}
                >
                    View Premium Plans →
                </button>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "14px 32px", background: "white",
                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                        fontSize: "15px", cursor: "pointer", color: "#64748b"
                    }}
                >
                    Go Back
                </button>
            </div>

            {/* Premium features list */}
            <div style={{
                marginTop: "48px", background: "#f8fafc",
                borderRadius: "16px", padding: "24px",
                border: "1px solid #e2e8f0", maxWidth: "480px", width: "100%"
            }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "16px" }}>
                    WHAT YOU GET WITH PREMIUM
                </p>
                {[
                    "⚡ AI Interview Question Generator",
                    "⚖️ Candidate Comparison Tool",
                    "📤 Bulk Resume Upload (10 at once)",
                    "🤖 AI Job Description Generator",
                    "📊 Advanced Analytics & Reports",
                    "🎯 Smart Shortlisting Suggestions"
                ].map(f => (
                    <div key={f} style={{
                        padding: "10px 0", borderBottom: "1px solid #e2e8f0",
                        fontSize: "14px", color: "#374151", textAlign: "left"
                    }}>{f}</div>
                ))}
            </div>
        </div>
    )
}

export default PremiumGate