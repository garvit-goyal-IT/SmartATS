import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { jobsAPI, candidatesAPI, interviewsAPI, applicationsAPI } from "../../api/index"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#f59e0b", "#f97316", "#fbbf24", "#fb923c", "#fcd34d"]

const PremiumDashboard = () => {
    const { user }   = useAuth()
    const navigate   = useNavigate()
    const [loading,  setLoading]      = useState(true)
    const [stats,    setStats]        = useState({ activeJobs: 0, totalCandidates: 0, interviewsToday: 0, hired: 0 })
    const [jobs,     setJobs]         = useState([])
    const [candidates, setCandidates] = useState([])
    const [applications, setApplications] = useState([])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [jRes, cRes, iRes] = await Promise.all([
                    jobsAPI.getAll(),
                    candidatesAPI.getAll(),
                    interviewsAPI.getAll()
                ])
                const j = jRes.data.jobs || []
                const c = cRes.data.candidates || []
                const i = iRes.data.interviews || []
                const today = new Date().toDateString()

                setJobs(j)
                setCandidates(c)
                setStats({
                    activeJobs:      j.filter(x => x.status === "open").length,
                    totalCandidates: c.length,
                    interviewsToday: i.filter(x => new Date(x.date).toDateString() === today).length,
                    hired:           i.filter(x => x.result === "pass").length
                })

                const appResults = await Promise.all(
                    j.slice(0, 5).map(job =>
                        applicationsAPI.getByJob(job._id)
                            .then(r => ({ jobTitle: job.title, apps: r.data.applications || [] }))
                            .catch(() => ({ jobTitle: job.title, apps: [] }))
                    )
                )
                setApplications(appResults)
            } catch(err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const applicantsPerJob = applications.map(a => ({
        name: a.jobTitle.length > 12 ? a.jobTitle.substring(0, 12) + "..." : a.jobTitle,
        applicants: a.apps.length,
        avgScore: a.apps.length > 0
            ? Math.round(a.apps.reduce((s, app) => s + (app.fitScore || 0), 0) / a.apps.length)
            : 0
    }))

    const pipelineData = (() => {
        const stages = {}
        applications.forEach(a => a.apps.forEach(app => {
            stages[app.status] = (stages[app.status] || 0) + 1
        }))
        return Object.entries(stages).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
    })()

    const card = (icon, value, label, path) => (
        <div onClick={() => navigate(path)} style={{
            background: "#111111", borderRadius: "16px",
            padding: "24px", border: "1px solid #1a1a1a",
            cursor: "pointer"
        }}>
            <div style={{ fontSize: "28px", marginBottom: "16px" }}>{icon}</div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "white", marginBottom: "4px" }}>
                {loading ? "—" : value}
            </div>
            <div style={{ color: "#606060", fontSize: "13px" }}>{label}</div>
        </div>
    )

    const chartStyle = {
        background: "#111111", borderRadius: "16px",
        padding: "24px", border: "1px solid #1a1a1a"
    }

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "white", marginBottom: "4px" }}>
                    Good morning, {user?.name?.split(" ")[0]} ⚡
                </h1>
                <p style={{ color: "#606060", fontSize: "15px" }}>
                    Your premium recruitment overview
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
                {card("💼", stats.activeJobs,      "Active Jobs",      "/premium/app/jobs")}
                {card("👥", stats.totalCandidates, "Total Candidates", "/premium/app/candidates")}
                {card("📅", stats.interviewsToday, "Interviews Today", "/premium/app/interviews")}
                {card("✅", stats.hired,           "Hired",           "/premium/app/pipeline")}
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div style={chartStyle}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white", marginBottom: "4px" }}>
                        Applicants per Job
                    </h3>
                    <p style={{ color: "#606060", fontSize: "13px", marginBottom: "20px" }}>
                        Candidates and average AI score per position
                    </p>
                    {applicantsPerJob.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#333" }}>
                            No data yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={applicantsPerJob}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#606060" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#606060" }} />
                                <Tooltip contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "12px", color: "white", fontSize: "13px" }} />
                                <Legend />
                                <Bar dataKey="applicants" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Applicants" />
                                <Bar dataKey="avgScore"   fill="#f97316" radius={[6, 6, 0, 0]} name="Avg Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={chartStyle}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white", marginBottom: "4px" }}>
                        Pipeline
                    </h3>
                    <p style={{ color: "#606060", fontSize: "13px", marginBottom: "20px" }}>
                        Candidates across stages
                    </p>
                    {pipelineData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#333" }}>No data</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "12px", color: "white", fontSize: "13px" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Premium features quick access */}
            <div style={{ background: "#111111", borderRadius: "16px", padding: "24px", border: "1px solid #1a1a1a" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white", marginBottom: "20px" }}>
                    ⚡ Premium Features
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                    {[
                        { icon: "⚖️", label: "Compare Candidates", path: "/premium/app/compare", desc: "AI side-by-side comparison" },
                        { icon: "📤", label: "Bulk Upload",         path: "/premium/app/bulk-upload", desc: "Upload 10 resumes at once" },
                        { icon: "🤖", label: "AI Job Generator",    path: "/premium/app/jobs/create", desc: "Generate job descriptions" },
                        { icon: "📊", label: "Analytics",           path: "/premium/app", desc: "Advanced hiring metrics" },
                    ].map(f => (
                        <div key={f.label} onClick={() => navigate(f.path)} style={{
                            padding: "20px", background: "#0a0a0a",
                            borderRadius: "12px", border: "1px solid #2a2a2a",
                            cursor: "pointer", transition: "border-color 0.15s"
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#f59e0b"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                        >
                            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.icon}</div>
                            <div style={{ fontWeight: "700", color: "white", fontSize: "14px", marginBottom: "4px" }}>
                                {f.label}
                            </div>
                            <div style={{ color: "#606060", fontSize: "12px" }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PremiumDashboard