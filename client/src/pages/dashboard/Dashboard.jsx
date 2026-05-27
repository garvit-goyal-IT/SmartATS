import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { jobsAPI, candidatesAPI, interviewsAPI } from "../../api/index"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
    const { user }      = useAuth()
    const navigate      = useNavigate()
    const [stats, setStats] = useState({
        activeJobs: 0, totalCandidates: 0,
        interviewsToday: 0, hired: 0
    })
    const [recentJobs,        setRecentJobs]        = useState([])
    const [recentCandidates,  setRecentCandidates]  = useState([])
    const [loading,           setLoading]           = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, candidatesRes, interviewsRes] = await Promise.all([
                    jobsAPI.getAll(),
                    candidatesAPI.getAll(),
                    interviewsAPI.getAll()
                ])

                const jobs          = jobsRes.data.jobs || []
                const candidates    = candidatesRes.data.candidates || []
                const interviews    = interviewsRes.data.interviews || []
                const today         = new Date().toDateString()
                const interviewsToday = interviews.filter(i =>
                    new Date(i.date).toDateString() === today
                ).length

                setStats({
                    activeJobs:       jobs.filter(j => j.status === "open").length,
                    totalCandidates:  candidates.length,
                    interviewsToday,
                    hired:            0
                })
                setRecentJobs(jobs.slice(0, 3))
                setRecentCandidates(candidates.slice(0, 3))
            } catch(err) {
                console.error("Dashboard fetch error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const statCards = [
        { label: "Active Jobs",      value: stats.activeJobs,      color: "#6366f1", bg: "#eef2ff",  icon: "💼" },
        { label: "Total Candidates", value: stats.totalCandidates, color: "#0ea5e9", bg: "#e0f2fe",  icon: "👥" },
        { label: "Interviews Today", value: stats.interviewsToday, color: "#f59e0b", bg: "#fef3c7",  icon: "📅" },
        { label: "Hired This Month", value: stats.hired,           color: "#22c55e", bg: "#dcfce7",  icon: "✅" },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    Good morning, {user?.name?.split(" ")[0]} 👋
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px" }}>
                    Here's what's happening with your recruitment today.
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                {statCards.map(stat => (
                    <div key={stat.label} style={{
                        background: "white", borderRadius: "16px",
                        padding: "24px", border: "1px solid #e2e8f0"
                    }}>
                        <div style={{
                            width: "48px", height: "48px", background: stat.bg,
                            borderRadius: "12px", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: "22px", marginBottom: "16px"
                        }}>{stat.icon}</div>
                        <div style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                            {loading ? "—" : stat.value}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "13px" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Recent Jobs */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Recent Jobs</h3>
                        <button onClick={() => navigate("/jobs")} style={{
                            background: "none", border: "none",
                            color: "#6366f1", fontSize: "13px",
                            fontWeight: "600", cursor: "pointer"
                        }}>View all →</button>
                    </div>
                    {loading ? <p style={{ color: "#64748b" }}>Loading...</p> :
                    recentJobs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                            <div style={{ fontSize: "32px", marginBottom: "8px" }}>💼</div>
                            <p>No jobs yet</p>
                            <button onClick={() => navigate("/jobs")} style={{
                                marginTop: "12px", padding: "8px 16px",
                                background: "#6366f1", color: "white",
                                border: "none", borderRadius: "8px",
                                fontSize: "13px", cursor: "pointer"
                            }}>Create first job</button>
                        </div>
                    ) : recentJobs.map(job => (
                        <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)}
                            style={{
                                padding: "12px 0", borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer", display: "flex",
                                justifyContent: "space-between", alignItems: "center"
                            }}>
                            <div>
                                <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{job.title}</div>
                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                                    {job.department} · {job.location}
                                </div>
                            </div>
                            <span style={{
                                padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                                background: job.status === "open" ? "#dcfce7" : "#fee2e2",
                                color: job.status === "open" ? "#16a34a" : "#dc2626"
                            }}>{job.status}</span>
                        </div>
                    ))}
                </div>

                {/* Recent Candidates */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Recent Candidates</h3>
                        <button onClick={() => navigate("/candidates")} style={{
                            background: "none", border: "none",
                            color: "#6366f1", fontSize: "13px",
                            fontWeight: "600", cursor: "pointer"
                        }}>View all →</button>
                    </div>
                    {loading ? <p style={{ color: "#64748b" }}>Loading...</p> :
                    recentCandidates.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                            <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
                            <p>No candidates yet</p>
                            <button onClick={() => navigate("/candidates")} style={{
                                marginTop: "12px", padding: "8px 16px",
                                background: "#6366f1", color: "white",
                                border: "none", borderRadius: "8px",
                                fontSize: "13px", cursor: "pointer"
                            }}>Upload resume</button>
                        </div>
                    ) : recentCandidates.map(c => (
                        <div key={c._id}
                            style={{
                                padding: "12px 0", borderBottom: "1px solid #f1f5f9",
                                display: "flex", alignItems: "center", gap: "12px"
                            }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: "#eef2ff", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                color: "#6366f1", fontWeight: "700", fontSize: "14px"
                            }}>
                                {c.personalInfo?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                                <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                                    {c.personalInfo?.name || "Unknown"}
                                </div>
                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                                    {c.parsedData?.skills?.slice(0, 3).join(", ") || "No skills extracted"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard