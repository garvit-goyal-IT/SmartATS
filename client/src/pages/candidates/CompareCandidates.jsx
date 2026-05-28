import { useState, useEffect } from "react"
import { jobsAPI, applicationsAPI } from "../../api/index"
import toast from "react-hot-toast"

const CompareCandidates = () => {
    const [jobs,         setJobs]         = useState([])
    const [selectedJob,  setSelectedJob]  = useState("")
    const [applications, setApplications] = useState([])
    const [selected,     setSelected]     = useState([])
    const [comparison,   setComparison]   = useState(null)
    const [loading,      setLoading]      = useState(false)
    const [loadingApps,  setLoadingApps]  = useState(false)

    useEffect(() => {
        jobsAPI.getAll().then(res => setJobs(res.data.jobs || []))
    }, [])

    const handleJobChange = async (jobId) => {
        setSelectedJob(jobId)
        setSelected([])
        setComparison(null)
        if(!jobId) return
        setLoadingApps(true)
        try {
            const res = await applicationsAPI.getByJob(jobId)
            setApplications(res.data.applications || [])
        } catch(err) {
            toast.error("Failed to fetch candidates")
        } finally {
            setLoadingApps(false)
        }
    }

    const toggleSelect = (appId) => {
        if(selected.includes(appId)) {
            setSelected(selected.filter(id => id !== appId))
        } else {
            if(selected.length >= 3) return toast.error("Max 3 candidates to compare")
            setSelected([...selected, appId])
        }
    }

    const handleCompare = async () => {
        if(selected.length < 2) return toast.error("Select at least 2 candidates")
        setLoading(true)
        try {
            const res = await applicationsAPI.compare({
                applicationIds: selected,
                jobId: selectedJob
            })
            setComparison(res.data)
            toast.success("AI comparison ready!")
        } catch(err) {
            toast.error("Comparison failed")
        } finally {
            setLoading(false)
        }
    }

    const verdictColor = {
        "Strong fit":  { bg: "#dcfce7", color: "#16a34a" },
        "Good fit":    { bg: "#e0f2fe", color: "#0369a1" },
        "Partial fit": { bg: "#fef3c7", color: "#d97706" },
        "Weak fit":    { bg: "#fee2e2", color: "#dc2626" },
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    Compare Candidates
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                    Select 2-3 candidates and let AI compare them side by side
                </p>
            </div>

            {/* Job selector */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                    Select Job Position
                </label>
                <select
                    value={selectedJob}
                    onChange={e => handleJobChange(e.target.value)}
                    style={{
                        width: "100%", padding: "12px 16px",
                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                        fontSize: "14px", outline: "none",
                        background: "white", cursor: "pointer"
                    }}
                >
                    <option value="">Select a job...</option>
                    {jobs.map(j => (
                        <option key={j._id} value={j._id}>{j.title}</option>
                    ))}
                </select>
            </div>

            {/* Candidates selection */}
            {selectedJob && (
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                                Select Candidates ({selected.length}/3)
                            </h3>
                            <p style={{ color: "#64748b", fontSize: "13px" }}>
                                Click to select candidates for comparison
                            </p>
                        </div>
                        <button
                            onClick={handleCompare}
                            disabled={selected.length < 2 || loading}
                            style={{
                                padding: "12px 24px",
                                background: selected.length < 2 ? "#e2e8f0" : loading ? "#a5b4fc" : "#6366f1",
                                color: selected.length < 2 ? "#94a3b8" : "white",
                                border: "none", borderRadius: "12px",
                                fontSize: "14px", fontWeight: "700",
                                cursor: selected.length < 2 ? "not-allowed" : "pointer"
                            }}
                        >
                            {loading ? "Comparing with AI..." : `⚡ Compare ${selected.length > 0 ? `(${selected.length})` : ""}`}
                        </button>
                    </div>

                    {loadingApps ? (
                        <div style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                            Loading candidates...
                        </div>
                    ) : applications.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                            No candidates for this job yet
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                            {applications.map(app => {
                                const isSelected = selected.includes(app._id)
                                const pd = Array.isArray(app.candidate?.parsedData)
                                    ? app.candidate.parsedData[0]
                                    : app.candidate?.parsedData

                                return (
                                    <div
                                        key={app._id}
                                        onClick={() => toggleSelect(app._id)}
                                        style={{
                                            padding: "16px", borderRadius: "12px",
                                            border: isSelected ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                                            background: isSelected ? "#eef2ff" : "#f8fafc",
                                            cursor: "pointer", transition: "all 0.15s"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                            <div style={{
                                                width: "40px", height: "40px", borderRadius: "50%",
                                                background: isSelected ? "#6366f1" : "#e2e8f0",
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center", color: isSelected ? "white" : "#64748b",
                                                fontWeight: "700", fontSize: "16px", flexShrink: 0
                                            }}>
                                                {isSelected ? "✓" : app.candidate?.personalInfo?.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
                                                    {app.candidate?.personalInfo?.name || "Unknown"}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                    {pd?.totalExperience || 0} years exp
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fit score */}
                                        <div style={{
                                            display: "flex", alignItems: "center",
                                            justifyContent: "space-between", marginBottom: "10px"
                                        }}>
                                            <span style={{ fontSize: "12px", color: "#64748b" }}>AI Fit Score</span>
                                            <span style={{
                                                fontSize: "18px", fontWeight: "800",
                                                color: app.fitScore >= 80 ? "#16a34a" :
                                                       app.fitScore >= 60 ? "#d97706" : "#dc2626"
                                            }}>{app.fitScore}</span>
                                        </div>

                                        {/* Score bar */}
                                        <div style={{ background: "#e2e8f0", borderRadius: "4px", height: "6px", marginBottom: "10px" }}>
                                            <div style={{
                                                width: `${app.fitScore}%`, height: "100%",
                                                borderRadius: "4px",
                                                background: app.fitScore >= 80 ? "#22c55e" :
                                                            app.fitScore >= 60 ? "#f59e0b" : "#ef4444"
                                            }} />
                                        </div>

                                        {/* Top skills */}
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                            {pd?.skills?.slice(0, 3).map(s => (
                                                <span key={s} style={{
                                                    padding: "2px 8px", background: "#eef2ff",
                                                    color: "#6366f1", borderRadius: "20px",
                                                    fontSize: "10px", fontWeight: "600"
                                                }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* AI Comparison Result */}
            {comparison && (
                <div>
                    {/* Summary */}
                    <div style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        borderRadius: "16px", padding: "28px",
                        marginBottom: "20px", color: "white"
                    }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                            ⚡ AI Comparison Summary
                        </h3>
                        <p style={{ fontSize: "15px", lineHeight: "1.7", opacity: 0.9, marginBottom: "16px" }}>
                            {comparison.comparison.summary}
                        </p>
                        <div style={{
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "12px", padding: "16px"
                        }}>
                            <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>
                                🏆 RECOMMENDATION
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: "700" }}>
                                {comparison.comparison.recommendation}
                            </div>
                        </div>
                    </div>

                    {/* Individual breakdowns */}
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparison.comparison.candidates.length}, 1fr)`, gap: "20px" }}>
                        {comparison.comparison.candidates.map((c, i) => {
                            const isWinner = c.name === comparison.comparison.winner
                            const vc = verdictColor[c.verdict] || { bg: "#f1f5f9", color: "#64748b" }

                            return (
                                <div key={i} style={{
                                    background: "white", borderRadius: "16px",
                                    padding: "24px",
                                    border: isWinner ? "2px solid #6366f1" : "1px solid #e2e8f0",
                                    position: "relative"
                                }}>
                                    {isWinner && (
                                        <div style={{
                                            position: "absolute", top: "-12px", left: "50%",
                                            transform: "translateX(-50%)",
                                            background: "#6366f1", color: "white",
                                            padding: "4px 14px", borderRadius: "20px",
                                            fontSize: "11px", fontWeight: "700"
                                        }}>🏆 Best Match</div>
                                    )}

                                    <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                                        {c.name}
                                    </h4>

                                    <span style={{
                                        display: "inline-block", padding: "4px 12px",
                                        borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                                        background: vc.bg, color: vc.color, marginBottom: "16px"
                                    }}>{c.verdict}</span>

                                    <div style={{ marginBottom: "16px" }}>
                                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a", marginBottom: "8px" }}>
                                            ✅ Strengths
                                        </div>
                                        {c.strengths.map((s, j) => (
                                            <div key={j} style={{
                                                fontSize: "13px", color: "#374151",
                                                padding: "4px 0", borderBottom: "1px solid #f1f5f9"
                                            }}>• {s}</div>
                                        ))}
                                    </div>

                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626", marginBottom: "8px" }}>
                                            ⚠️ Areas to probe
                                        </div>
                                        {c.weaknesses.map((w, j) => (
                                            <div key={j} style={{
                                                fontSize: "13px", color: "#374151",
                                                padding: "4px 0", borderBottom: "1px solid #f1f5f9"
                                            }}>• {w}</div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CompareCandidates