import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { jobsAPI, candidatesAPI, interviewsAPI, applicationsAPI } from "../../api/index"
import { useNavigate } from "react-router-dom"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, LineChart, Line,
    ResponsiveContainer, Legend
} from "recharts"

const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#f97316"]

const Dashboard = () => {
    const { user }    = useAuth()
    const navigate    = useNavigate()
    const [loading,   setLoading]   = useState(true)
    const [stats,     setStats]     = useState({ activeJobs: 0, totalCandidates: 0, interviewsToday: 0, hired: 0 })
    const [jobs,      setJobs]      = useState([])
    const [candidates, setCandidates] = useState([])
    const [interviews, setInterviews] = useState([])
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
                setInterviews(i)

                setStats({
                    activeJobs:      j.filter(x => x.status === "open").length,
                    totalCandidates: c.length,
                    interviewsToday: i.filter(x => new Date(x.date).toDateString() === today).length,
                    hired:           i.filter(x => x.result === "pass").length
                })

                // fetch applications for all jobs
                const appPromises = j.slice(0, 5).map(job =>
                    applicationsAPI.getByJob(job._id)
                        .then(r => ({ jobTitle: job.title, apps: r.data.applications || [] }))
                        .catch(() => ({ jobTitle: job.title, apps: [] }))
                )
                const appResults = await Promise.all(appPromises)
                setApplications(appResults)

            } catch(err) {
                console.error("Dashboard error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    // chart data
    const applicantsPerJob = applications.map(a => ({
        name: a.jobTitle.length > 15 ? a.jobTitle.substring(0, 15) + "..." : a.jobTitle,
        applicants: a.apps.length,
        avgScore: a.apps.length > 0
            ? Math.round(a.apps.reduce((sum, app) => sum + (app.fitScore || 0), 0) / a.apps.length)
            : 0
    }))

    const pipelineData = (() => {
        const stages = {}
        applications.forEach(a => {
            a.apps.forEach(app => {
                stages[app.status] = (stages[app.status] || 0) + 1
            })
        })
        return Object.entries(stages).map(([name, value]) => ({
            name: name.replace(/_/g, " "),
            value
        }))
    })()

    const jobStatusData = [
        { name: "Open",    value: jobs.filter(j => j.status === "open").length },
        { name: "Closed",  value: jobs.filter(j => j.status === "closed").length },
        { name: "On Hold", value: jobs.filter(j => j.status === "on_hold").length },
    ].filter(d => d.value > 0)

    const interviewResultData = [
        { name: "Pass",    value: interviews.filter(i => i.result === "pass").length },
        { name: "Fail",    value: interviews.filter(i => i.result === "fail").length },
        { name: "Pending", value: interviews.filter(i => i.result === "pending").length },
    ].filter(d => d.value > 0)

    const scoreDistribution = (() => {
        const allApps = applications.flatMap(a => a.apps)
        return [
            { range: "90-100", count: allApps.filter(a => a.fitScore >= 90).length },
            { range: "80-89",  count: allApps.filter(a => a.fitScore >= 80 && a.fitScore < 90).length },
            { range: "70-79",  count: allApps.filter(a => a.fitScore >= 70 && a.fitScore < 80).length },
            { range: "60-69",  count: allApps.filter(a => a.fitScore >= 60 && a.fitScore < 70).length },
            { range: "<60",    count: allApps.filter(a => a.fitScore < 60).length },
        ]
    })()

    const statCards = [
        { label: "Active Jobs",      value: stats.activeJobs,      color: "#6366f1", bg: "#eef2ff",  icon: "💼", path: "/jobs" },
        { label: "Total Candidates", value: stats.totalCandidates, color: "#0ea5e9", bg: "#e0f2fe",  icon: "👥", path: "/candidates" },
        { label: "Interviews Today", value: stats.interviewsToday, color: "#f59e0b", bg: "#fef3c7",  icon: "📅", path: "/interviews" },
        { label: "Hired",            value: stats.hired,           color: "#22c55e", bg: "#dcfce7",  icon: "✅", path: "/pipeline" },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    Good morning, {user?.name?.split(" ")[0]} 👋
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px" }}>
                    Here's your recruitment overview for today.
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
                {statCards.map(stat => (
                    <div key={stat.label}
                        onClick={() => navigate(stat.path)}
                        style={{
                            background: "white", borderRadius: "16px",
                            padding: "24px", border: "1px solid #e2e8f0",
                            cursor: "pointer", transition: "transform 0.15s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
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

            {/* Row 1 — Applicants per job + Pipeline distribution */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>

                {/* Applicants per job */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        Applicants per Job
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                        Number of candidates and average AI score per position
                    </p>
                    {applicantsPerJob.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            No data yet — create jobs and upload resumes
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={applicantsPerJob}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                                />
                                <Legend />
                                <Bar dataKey="applicants" fill="#6366f1" radius={[6, 6, 0, 0]} name="Applicants" />
                                <Bar dataKey="avgScore"   fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Avg AI Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pipeline distribution */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        Pipeline Distribution
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                        Candidates across all stages
                    </p>
                    {pipelineData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            No pipeline data yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pipelineData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pipelineData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Row 2 — Score distribution + Job status + Interview results */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>

                {/* Score distribution */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        AI Score Distribution
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                        How candidates are scoring across all positions
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={scoreDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="range" tick={{ fontSize: 12, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidates">
                                {scoreDistribution.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.range === "90-100" ? "#22c55e" :
                                              entry.range === "80-89"  ? "#0ea5e9" :
                                              entry.range === "70-79"  ? "#f59e0b" :
                                              entry.range === "60-69"  ? "#f97316" : "#ef4444"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Job status */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        Job Status
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                        Open vs closed positions
                    </p>
                    {jobStatusData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "13px" }}>
                            No jobs yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={jobStatusData}
                                    cx="50%" cy="50%"
                                    outerRadius={70}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    {jobStatusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Interview results */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        Interview Results
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                        Pass / fail / pending
                    </p>
                    {interviewResultData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "13px" }}>
                            No interviews yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={interviewResultData}
                                    cx="50%" cy="50%"
                                    outerRadius={70}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    {interviewResultData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={entry.name === "Pass" ? "#22c55e" :
                                                  entry.name === "Fail" ? "#ef4444" : "#94a3b8"}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Row 3 — Recent activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                {/* Recent jobs */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Recent Jobs</h3>
                        <button onClick={() => navigate("/jobs")} style={{
                            background: "none", border: "none", color: "#6366f1",
                            fontSize: "13px", fontWeight: "600", cursor: "pointer"
                        }}>View all →</button>
                    </div>
                    {jobs.slice(0, 4).map(job => (
                        <div key={job._id}
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", padding: "12px 0",
                                borderBottom: "1px solid #f1f5f9", cursor: "pointer"
                            }}>
                            <div>
                                <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                                    {job.title}
                                </div>
                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                                    {job.department} · {job.applicantCount || 0} applicants
                                </div>
                            </div>
                            <span style={{
                                padding: "4px 10px", borderRadius: "20px",
                                fontSize: "11px", fontWeight: "700",
                                background: job.status === "open" ? "#dcfce7" : "#fee2e2",
                                color: job.status === "open" ? "#16a34a" : "#dc2626"
                            }}>{job.status}</span>
                        </div>
                    ))}
                    {jobs.length === 0 && (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                            No jobs yet
                        </div>
                    )}
                </div>

                {/* Recent candidates */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Recent Candidates</h3>
                        <button onClick={() => navigate("/candidates")} style={{
                            background: "none", border: "none", color: "#6366f1",
                            fontSize: "13px", fontWeight: "600", cursor: "pointer"
                        }}>View all →</button>
                    </div>
                    {candidates.slice(0, 4).map(c => (
                        <div key={c._id}
                            onClick={() => navigate(`/candidates/${c._id}`)}
                            style={{
                                display: "flex", alignItems: "center",
                                gap: "12px", padding: "12px 0",
                                borderBottom: "1px solid #f1f5f9", cursor: "pointer"
                            }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: "#eef2ff", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                color: "#6366f1", fontWeight: "700",
                                fontSize: "14px", flexShrink: 0
                            }}>
                                {c.personalInfo?.name?.charAt(0) || "?"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                                    {c.personalInfo?.name || "Unknown"}
                                </div>
                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                                    {(Array.isArray(c.parsedData) ? c.parsedData[0]?.skills : c.parsedData?.skills)
                                        ?.slice(0, 3).join(", ") || "No skills"}
                                </div>
                            </div>
                            {c.isDuplicate && (
                                <span style={{
                                    padding: "3px 8px", background: "#fee2e2",
                                    color: "#dc2626", borderRadius: "20px",
                                    fontSize: "10px", fontWeight: "700"
                                }}>Duplicate</span>
                            )}
                        </div>
                    ))}
                    {candidates.length === 0 && (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                            No candidates yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard