import { useAuth } from "../../context/AuthContext"

const Dashboard = () => {
    const { user } = useAuth()

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    Good morning, {user?.name?.split(" ")[0]} 👋
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px" }}>
                    Here's what's happening with your recruitment today.
                </p>
            </div>

            {/* Stats cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                {[
                    { label: "Active Jobs",       value: "0", color: "#6366f1", bg: "#eef2ff" },
                    { label: "Total Candidates",  value: "0", color: "#0ea5e9", bg: "#e0f2fe" },
                    { label: "Interviews Today",  value: "0", color: "#f59e0b", bg: "#fef3c7" },
                    { label: "Hired This Month",  value: "0", color: "#22c55e", bg: "#dcfce7" },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #e2e8f0"
                    }}>
                        <div style={{
                            width: "44px", height: "44px",
                            background: stat.bg, borderRadius: "12px",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", marginBottom: "16px"
                        }}>
                            <div style={{ width: "20px", height: "20px", background: stat.color, borderRadius: "4px" }}/>
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                            {stat.value}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "13px" }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "32px",
                border: "1px solid #e2e8f0",
                textAlign: "center"
            }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                    Welcome to Smart ATS Hiring Suite
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                    Start by creating a job posting or uploading candidate resumes.
                </p>
            </div>
        </div>
    )
}

export default Dashboard