import { useState, useEffect } from "react"
import { jobsAPI, applicationsAPI } from "../../api/index"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const STAGES = [
    { key: "applied",              label: "Applied",     color: "#6366f1", bg: "#eef2ff" },
    { key: "screening",            label: "Screening",   color: "#f59e0b", bg: "#fef3c7" },
    { key: "shortlisted",          label: "Shortlisted", color: "#0ea5e9", bg: "#e0f2fe" },
    { key: "interview_scheduled",  label: "Interview",   color: "#8b5cf6", bg: "#f5f3ff" },
    { key: "offer_sent",           label: "Offer",       color: "#f97316", bg: "#fff7ed" },
    { key: "hired",                label: "Hired",       color: "#22c55e", bg: "#dcfce7" },
    { key: "rejected",             label: "Rejected",    color: "#ef4444", bg: "#fee2e2" },
]

const Pipeline = () => {
    const [jobs,         setJobs]         = useState([])
    const [selectedJob,  setSelectedJob]  = useState("")
    const [applications, setApplications] = useState([])
    const [loading,      setLoading]      = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        jobsAPI.getAll().then(res => {
            const j = res.data.jobs || []
            setJobs(j)
            if(j.length > 0) setSelectedJob(j[0]._id)
        })
    }, [])

    useEffect(() => {
        if(!selectedJob) return
        setLoading(true)
        applicationsAPI.getByJob(selectedJob)
            .then(res => setApplications(res.data.applications || []))
            .catch(() => toast.error("Failed to fetch applications"))
            .finally(() => setLoading(false))
    }, [selectedJob])

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await applicationsAPI.updateStatus(appId, { status: newStatus })
            toast.success(`Moved to ${newStatus}`)
            const res = await applicationsAPI.getByJob(selectedJob)
            setApplications(res.data.applications || [])
        } catch(err) {
            toast.error("Failed to update status")
        }
    }

    const getStageApps = (stage) => applications.filter(a => a.status === stage)

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                        Candidate Pipeline
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        AI-ranked candidates across hiring stages
                    </p>
                </div>
                <select
                    value={selectedJob}
                    onChange={e => setSelectedJob(e.target.value)}
                    style={{
                        padding: "12px 20px", border: "1.5px solid #e2e8f0",
                        borderRadius: "12px", fontSize: "14px",
                        outline: "none", background: "white",
                        cursor: "pointer", minWidth: "240px"
                    }}
                >
                    <option value="">Select a job...</option>
                    {jobs.map(j => (
                        <option key={j._id} value={j._id}>{j.title}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {[
                    { label: "Total",       value: applications.length,                                    color: "#6366f1" },
                    { label: "Shortlisted", value: getStageApps("shortlisted").length,                    color: "#0ea5e9" },
                    { label: "Interviews",  value: getStageApps("interview_scheduled").length,             color: "#8b5cf6" },
                    { label: "Hired",       value: getStageApps("hired").length,                          color: "#22c55e" },
                ].map(s => (
                    <div key={s.label} style={{
                        background: "white", borderRadius: "12px",
                        padding: "20px", border: "1px solid #e2e8f0",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.value}</div>
                        <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Kanban board */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#64748b" }}>Loading pipeline...</div>
            ) : !selectedJob ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
                    Select a job to view the pipeline
                </div>
            ) : (
                <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px" }}>
                    {STAGES.map(stage => {
                        const stageApps = getStageApps(stage.key)
                        return (
                            <div key={stage.key} style={{
                                minWidth: "280px", background: "#f8fafc",
                                borderRadius: "16px", padding: "16px",
                                border: "1px solid #e2e8f0"
                            }}>
                                {/* Stage header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{
                                            width: "10px", height: "10px",
                                            borderRadius: "50%", background: stage.color
                                        }}/>
                                        <span style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>
                                            {stage.label}
                                        </span>
                                    </div>
                                    <span style={{
                                        width: "24px", height: "24px",
                                        background: stage.bg, color: stage.color,
                                        borderRadius: "50%", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        fontSize: "12px", fontWeight: "700"
                                    }}>{stageApps.length}</span>
                                </div>

                                {/* Cards */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {stageApps.map(app => (
                                        <div key={app._id} style={{
                                            background: "white", borderRadius: "12px",
                                            padding: "16px", border: "1px solid #e2e8f0"
                                        }}>
                                            {/* Candidate info */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                                <div style={{
                                                    width: "36px", height: "36px", borderRadius: "50%",
                                                    background: "#eef2ff", display: "flex",
                                                    alignItems: "center", justifyContent: "center",
                                                    color: "#6366f1", fontWeight: "700", fontSize: "14px",
                                                    flexShrink: 0
                                                }}>
                                                    {app.candidate?.personalInfo?.name?.charAt(0) || "?"}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>
                                                        {app.candidate?.personalInfo?.name || "Unknown"}
                                                    </div>
                                                    <div style={{ color: "#64748b", fontSize: "11px" }}>
                                                        {app.candidate?.parsedData?.experience?.[0]?.title ||
                                                         app.candidate?.parsedData?.[0]?.experience?.[0]?.title || "—"}
                                                    </div>
                                                </div>
                                                {/* Fit score */}
                                                <div style={{
                                                    width: "40px", height: "40px", borderRadius: "50%",
                                                    background: app.fitScore >= 80 ? "#dcfce7" : app.fitScore >= 60 ? "#fef3c7" : "#fee2e2",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    flexShrink: 0
                                                }}>
                                                    <span style={{
                                                        fontSize: "11px", fontWeight: "800",
                                                        color: app.fitScore >= 80 ? "#16a34a" : app.fitScore >= 60 ? "#d97706" : "#dc2626"
                                                    }}>{app.fitScore}</span>
                                                </div>
                                            </div>

                                            {/* AI recommendation */}
                                            {app.aiAnalysis?.recommendation && (
                                                <p style={{
                                                    fontSize: "11px", color: "#64748b",
                                                    background: "#f8fafc", padding: "8px 10px",
                                                    borderRadius: "8px", marginBottom: "12px",
                                                    lineHeight: "1.5"
                                                }}>
                                                    ✨ {app.aiAnalysis.recommendation.substring(0, 80)}...
                                                </p>
                                            )}

                                            {/* Matched skills */}
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                                                {app.aiAnalysis?.matchedSkills?.slice(0, 3).map(s => (
                                                    <span key={s} style={{
                                                        padding: "2px 8px", background: "#dcfce7",
                                                        color: "#16a34a", borderRadius: "20px", fontSize: "10px", fontWeight: "600"
                                                    }}>{s}</span>
                                                ))}
                                                {app.aiAnalysis?.missingSkills?.slice(0, 2).map(s => (
                                                    <span key={s} style={{
                                                        padding: "2px 8px", background: "#fee2e2",
                                                        color: "#dc2626", borderRadius: "20px", fontSize: "10px", fontWeight: "600"
                                                    }}>{s}</span>
                                                ))}
                                            </div>

                                            {/* Move stage buttons */}
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    onClick={() => navigate(`/candidates/${app.candidate?._id}`)}
                                                    style={{
                                                        flex: 1, padding: "8px",
                                                        background: "#f1f5f9", border: "none",
                                                        borderRadius: "8px", fontSize: "11px",
                                                        fontWeight: "600", cursor: "pointer", color: "#374151"
                                                    }}
                                                >View</button>

                                                {stage.key !== "hired" && stage.key !== "rejected" && (
                                                    <select
                                                        value={app.status}
                                                        onChange={e => handleStatusChange(app._id, e.target.value)}
                                                        style={{
                                                            flex: 2, padding: "8px",
                                                            background: stage.bg, border: "none",
                                                            borderRadius: "8px", fontSize: "11px",
                                                            fontWeight: "600", cursor: "pointer",
                                                            color: stage.color
                                                        }}
                                                    >
                                                        {STAGES.map(s => (
                                                            <option key={s.key} value={s.key}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {stageApps.length === 0 && (
                                        <div style={{
                                            textAlign: "center", padding: "24px",
                                            color: "#94a3b8", fontSize: "12px"
                                        }}>
                                            No candidates
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Pipeline