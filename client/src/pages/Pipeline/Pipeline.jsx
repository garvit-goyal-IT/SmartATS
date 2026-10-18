import { useState, useEffect } from "react"
import { jobsAPI, applicationsAPI } from "../../api/index"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const COLUMNS = [
    { key: "applied",     label: "Applied",     statuses: ["applied"],                          dropStatus: "applied",     color: "#6366f1", bg: "#eef2ff" },
    { key: "screening",   label: "Screening",   statuses: ["screening"],                        dropStatus: "screening",   color: "#f59e0b", bg: "#fef3c7" },
    { key: "shortlisted", label: "Shortlisted", statuses: ["shortlisted"],                      dropStatus: "shortlisted", color: "#0ea5e9", bg: "#e0f2fe" },
    { key: "interview",   label: "Interview",   statuses: ["interview_scheduled", "interviewed"], dropStatus: "interviewed", color: "#8b5cf6", bg: "#f5f3ff" },
    { key: "offer",       label: "Offer",       statuses: ["offer_sent"],                       dropStatus: "offer_sent",  color: "#f97316", bg: "#fff7ed" },
    { key: "hired",       label: "Hired",       statuses: ["hired"],                            dropStatus: "hired",       color: "#22c55e", bg: "#dcfce7" },
]

const REJECTED = { key: "rejected", label: "Rejected", statuses: ["rejected"], dropStatus: "rejected", color: "#ef4444", bg: "#fee2e2" }

// Moves the backend allows
const NEXT = {
    applied: ["screening", "rejected"],
    screening: ["shortlisted", "rejected"],
    shortlisted: ["rejected"],
    interview_scheduled: ["interviewed", "rejected"],
    interviewed: ["rejected"],
}

const MOVE_LABEL = {
    screening: "Screening", shortlisted: "Shortlisted",
    interviewed: "Interviewed", rejected: "Rejected",
}

const DROP_HINT = {
    interview: "Schedule interviews from the Interviews page",
    offer: "Use the Send offer button on an interviewed candidate",
    hired: "A candidate becomes hired when the offer is accepted",
}

const scoreColors = (s) =>
    s >= 80 ? { bg: "#dcfce7", fg: "#16a34a" } :
    s >= 60 ? { bg: "#fef3c7", fg: "#d97706" } :
              { bg: "#fee2e2", fg: "#dc2626" }

const Pipeline = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [selectedJob, setSelectedJob] = useState("")
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(false)
    const [draggedId, setDraggedId] = useState(null)
    const [overCol, setOverCol] = useState(null)

    useEffect(() => {
        jobsAPI.getAll().then(res => {
            const j = res.data.jobs || []
            setJobs(j)
            if (j.length > 0) setSelectedJob(j[0]._id)
        })
    }, [])

    useEffect(() => {
        if (!selectedJob) return
        setLoading(true)
        applicationsAPI.getByJob(selectedJob)
            .then(res => setApplications(res.data.applications || []))
            .catch(() => toast.error("Failed to fetch applications"))
            .finally(() => setLoading(false))
    }, [selectedJob])

    const refresh = async () => {
        const res = await applicationsAPI.getByJob(selectedJob)
        setApplications(res.data.applications || [])
    }

    const handleStatusChange = async (appId, newStatus) => {
        const previous = applications
    
        // move the card immediately
        setApplications(apps =>
            apps.map(a => a._id === appId ? { ...a, status: newStatus } : a)
        )
    
        try {
            await applicationsAPI.updateStatus(appId, { status: newStatus })
            // no refetch needed, the screen is already correct
        } catch (err) {
            setApplications(previous)   // put it back
            toast.error(err.response?.data?.message || "Failed to update status")
        }
    }

    const handleOffer = async (appId) => {
        try {
            await applicationsAPI.sendOffer(appId, {})
            toast.success("Offer sent")
            refresh()
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not send offer")
        }
    }

    const handleOfferResponse = async (appId, decision) => {
        try {
            await applicationsAPI.offerResponse(appId, { decision })
            toast.success(decision === "accepted" ? "Marked as hired" : "Offer declined")
            refresh()
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed")
        }
    }

    const inColumn = (col) => applications.filter(a => col.statuses.includes(a.status))

    // ── Drag and drop ──
    const onDragStart = (e, app) => {
        e.dataTransfer.setData("text/plain", app._id)
        e.dataTransfer.effectAllowed = "move"
        // update state after the drag has started, or Chrome can cancel the drag
        setTimeout(() => setDraggedId(app._id), 0)
    }
    const onDragEnd = () => { setDraggedId(null); setOverCol(null) }
    const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move" }
    const onDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOverCol(null)
    }
    const onDrop = (e, col) => {
        e.preventDefault()
        const id = e.dataTransfer.getData("text/plain")
        const app = applications.find(a => a._id === id)
        setDraggedId(null)
        setOverCol(null)
        if (!app || col.statuses.includes(app.status)) return

        if (NEXT[app.status]?.includes(col.dropStatus)) {
            handleStatusChange(app._id, col.dropStatus)
        } else {
            toast.error(DROP_HINT[col.key] || "That move isn't allowed from this stage")
        }
    }

    const isHM = user?.role === "hiring_manager"

    const renderCard = (app, col) => {
        const score = app.aiAnalysis?.fitScore ?? 0
        const sc = scoreColors(score)
        const moves = NEXT[app.status]
        const jobTitle = app.candidate?.parsedData?.experience?.[0]?.title

        return (
            <div
                key={app._id}
                draggable={!!moves}
                onDragStart={(e) => onDragStart(e, app)}
                onDragEnd={onDragEnd}
                title={app.aiAnalysis?.recommendation || ""}
                style={{
                    background: "white", borderRadius: "10px", padding: "10px",
                    border: "1px solid #e2e8f0",
                    cursor: moves ? "grab" : "default",
                    opacity: draggedId === app._id ? 0.4 : 1,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", background: col.bg,
                        color: col.color, display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: "700", fontSize: "12px", flexShrink: 0,
                    }}>
                        {app.candidate?.personalInfo?.name?.charAt(0) || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "700", fontSize: "12px", color: "#0f172a",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {app.candidate?.personalInfo?.name || "Unknown"}
                        </div>
                        {jobTitle && (
                            <div style={{ color: "#64748b", fontSize: "10px",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {jobTitle}
                            </div>
                        )}
                    </div>
                    <div style={{
                        width: "30px", height: "30px", borderRadius: "50%", background: sc.bg,
                        color: sc.fg, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "11px", fontWeight: "800", flexShrink: 0,
                    }}>{score}</div>
                </div>

                {col.key === "interview" && (
                    <div style={{
                        display: "inline-block", fontSize: "10px", fontWeight: "600",
                        padding: "2px 8px", borderRadius: "20px", marginBottom: "8px",
                        background: app.status === "interviewed" ? "#ccfbf1" : "#f5f3ff",
                        color: app.status === "interviewed" ? "#0f766e" : "#8b5cf6",
                    }}>
                        {app.status === "interviewed" ? "Interviewed" : "Scheduled"}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button onClick={() => navigate(`/candidates/${app.candidate?._id}`)} style={btn("#f1f5f9", "#374151")}>
                        View
                    </button>

                    {moves && (
                        <select
                            value=""
                            onChange={e => e.target.value && handleStatusChange(app._id, e.target.value)}
                            style={{ ...btn(col.bg, col.color), width: "100%" }}
                        >
                            <option value="">Move to...</option>
                            {moves.map(k => <option key={k} value={k}>{MOVE_LABEL[k]}</option>)}
                        </select>
                    )}

                    {isHM && app.status === "interviewed" && (
                        <button onClick={() => handleOffer(app._id)} style={btn("#f97316", "white")}>
                            Send offer
                        </button>
                    )}

                    {isHM && app.status === "offer_sent" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleOfferResponse(app._id, "accepted")} style={{ ...btn("#22c55e", "white"), flex: 1 }}>Accepted</button>
                            <button onClick={() => handleOfferResponse(app._id, "declined")} style={{ ...btn("#ef4444", "white"), flex: 1 }}>Declined</button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const stats = [
        { label: "Total", value: applications.length, color: "#6366f1" },
        { label: "Shortlisted", value: applications.filter(a => a.status === "shortlisted").length, color: "#0ea5e9" },
        { label: "Interviews", value: applications.filter(a => a.status === "interview_scheduled").length, color: "#8b5cf6" },
        { label: "Hired", value: applications.filter(a => a.status === "hired").length, color: "#22c55e" },
    ]

    const rejectedApps = inColumn(REJECTED)

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>
                        Candidate Pipeline
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                        Drag candidates to move stages · AI-ranked candidates across hiring stages
                    </p>
                </div>
                <select
                    value={selectedJob}
                    onChange={e => setSelectedJob(e.target.value)}
                    style={{
                        padding: "12px 20px", border: "1.5px solid #e2e8f0", borderRadius: "12px",
                        fontSize: "14px", outline: "none", background: "white",
                        cursor: "pointer", minWidth: "240px",
                    }}
                >
                    <option value="">Select a job...</option>
                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                </select>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px", marginBottom: "24px" }}>
                {stats.map(s => (
                    <div key={s.label} style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.value}</div>
                        <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>Loading pipeline...</div>
            ) : !selectedJob ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>Select a job to view the pipeline</div>
            ) : (
                <>
                    {/* Board: 6 equal columns, scrolls only on very narrow screens */}
                    <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(0, 1fr))`,
                            gap: "10px", alignItems: "start", minWidth: "860px",
                        }}>
                            {COLUMNS.map(col => {
                                const items = inColumn(col)
                                const isOver = overCol === col.key
                                return (
                                    <div
                                        key={col.key}
                                        onDragOver={onDragOver}
                                        onDragEnter={() => setOverCol(col.key)}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, col)}
                                        style={{
                                            background: isOver ? col.bg : "#f8fafc",
                                            border: isOver ? `2px dashed ${col.color}` : "1px solid #e2e8f0",
                                            borderRadius: "14px", padding: "10px", minHeight: "240px",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                                                <span style={{ fontWeight: "700", fontSize: "12px", color: "#0f172a", whiteSpace: "nowrap" }}>
                                                    {col.label}
                                                </span>
                                            </div>
                                            <span style={{
                                                minWidth: "20px", height: "20px", background: col.bg, color: col.color,
                                                borderRadius: "10px", display: "flex", alignItems: "center",
                                                justifyContent: "center", fontSize: "11px", fontWeight: "700",
                                            }}>{items.length}</span>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {items.map(app => renderCard(app, col))}
                                            {items.length === 0 && (
                                                <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "11px" }}>
                                                    No candidates
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Rejected drop bar */}
                    <div
                        onDragOver={onDragOver}
                        onDragEnter={() => setOverCol("rejected")}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, REJECTED)}
                        style={{
                            marginTop: "16px", padding: "14px 16px", borderRadius: "14px",
                            background: overCol === "rejected" ? REJECTED.bg : "#fff",
                            border: overCol === "rejected" ? `2px dashed ${REJECTED.color}` : "1px dashed #fca5a5",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: REJECTED.color }} />
                            <span style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>
                                Rejected ({rejectedApps.length})
                            </span>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>Drag a candidate here to reject</span>
                        </div>

                        {rejectedApps.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                                {rejectedApps.map(app => (
                                    <button
                                        key={app._id}
                                        onClick={() => navigate(`/candidates/${app.candidate?._id}`)}
                                        style={{
                                            padding: "6px 12px", borderRadius: "20px", border: "none",
                                            background: REJECTED.bg, color: REJECTED.color,
                                            fontSize: "12px", fontWeight: "600", cursor: "pointer",
                                        }}
                                    >
                                        {app.candidate?.personalInfo?.name || "Unknown"} · {app.aiAnalysis?.fitScore ?? 0}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

const btn = (bg, color) => ({
    padding: "6px 8px", background: bg, color, border: "none",
    borderRadius: "8px", fontSize: "11px", fontWeight: "600", cursor: "pointer",
})

export default Pipeline