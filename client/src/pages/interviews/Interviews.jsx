import { useState, useEffect } from "react"
import { interviewsAPI, applicationsAPI, jobsAPI } from "../../api/index"
import toast from "react-hot-toast"

const Interviews = () => {
    const [interviews,   setInterviews]   = useState([])
    const [jobs,         setJobs]         = useState([])
    const [applications, setApplications] = useState([])
    const [loading,      setLoading]      = useState(true)
    const [showForm,     setShowForm]     = useState(false)
    const [form, setForm] = useState({
        applicationId: "", date: "", time: "",
        mode: "video", meetingLink: "", duration: 60
    })

    const fetchData = async () => {
        try {
            const [iRes, jRes] = await Promise.all([
                interviewsAPI.getAll(),
                jobsAPI.getAll()
            ])
            setInterviews(iRes.data.interviews || [])
            setJobs(jRes.data.jobs || [])
        } catch(err) {
            toast.error("Failed to fetch interviews")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleJobChange = async (jobId) => {
        if(!jobId) return
        try {
            const res = await applicationsAPI.getByJob(jobId)
            setApplications(res.data.applications || [])
        } catch(err) {
            toast.error("Failed to fetch applications")
        }
    }

    const handleSchedule = async (e) => {
        e.preventDefault()
        if(!form.applicationId || !form.date || !form.time) {
            return toast.error("Please fill all required fields")
        }
        try {
            await interviewsAPI.schedule(form)
            toast.success("Interview scheduled!")
            setShowForm(false)
            setForm({ applicationId: "", date: "", time: "", mode: "video", meetingLink: "", duration: 60 })
            fetchData()
        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to schedule")
        }
    }

    const handleUpdateResult = async (id, result) => {
        try {
            await interviewsAPI.update(id, {
                result,
                status: "completed"
            })
            toast.success("Interview result updated")
            fetchData()
        } catch(err) {
            toast.error("Failed to update")
        }
    }

    const inputStyle = {
        width: "100%", padding: "12px 16px",
        border: "1.5px solid #e2e8f0", borderRadius: "12px",
        fontSize: "14px", outline: "none",
        boxSizing: "border-box", background: "white"
    }

    const statusColor = {
        scheduled:  { bg: "#e0f2fe", color: "#0369a1" },
        completed:  { bg: "#dcfce7", color: "#16a34a" },
        cancelled:  { bg: "#fee2e2", color: "#dc2626" },
        rescheduled:{ bg: "#fef3c7", color: "#d97706" },
    }

    const resultColor = {
        pending: { bg: "#f1f5f9", color: "#64748b" },
        pass:    { bg: "#dcfce7", color: "#16a34a" },
        fail:    { bg: "#fee2e2", color: "#dc2626" },
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                        Interviews
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        Schedule and manage interview rounds
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    padding: "12px 24px", background: "#6366f1",
                    color: "white", border: "none", borderRadius: "12px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer"
                }}>
                    + Schedule Interview
                </button>
            </div>

            {/* Schedule form */}
            {showForm && (
                <div style={{
                    background: "white", borderRadius: "16px",
                    padding: "28px", border: "1px solid #e2e8f0", marginBottom: "24px"
                }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>
                        Schedule New Interview
                    </h3>
                    <form onSubmit={handleSchedule}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Select Job *
                                </label>
                                <select onChange={e => handleJobChange(e.target.value)} style={inputStyle}>
                                    <option value="">Select job...</option>
                                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Select Candidate *
                                </label>
                                <select
                                    value={form.applicationId}
                                    onChange={e => setForm({ ...form, applicationId: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">Select candidate...</option>
                                    {applications.map(app => (
                                        <option key={app._id} value={app._id}>
                                            {app.candidate?.personalInfo?.name || "Unknown"} — Score: {app.fitScore}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Date *
                                </label>
                                <input type="date" value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Time *
                                </label>
                                <input type="time" value={form.time}
                                    onChange={e => setForm({ ...form, time: e.target.value })}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Mode
                                </label>
                                <select value={form.mode}
                                    onChange={e => setForm({ ...form, mode: e.target.value })}
                                    style={inputStyle}>
                                    <option value="video">Video Call</option>
                                    <option value="phone">Phone</option>
                                    <option value="onSite">On-site</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Duration (minutes)
                                </label>
                                <input type="number" value={form.duration}
                                    onChange={e => setForm({ ...form, duration: e.target.value })}
                                    style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Meeting Link
                                </label>
                                <input type="url" value={form.meetingLink}
                                    placeholder="https://meet.google.com/..."
                                    onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                                    style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button type="submit" style={{
                                padding: "12px 24px", background: "#6366f1",
                                color: "white", border: "none", borderRadius: "12px",
                                fontSize: "14px", fontWeight: "700", cursor: "pointer"
                            }}>Schedule Interview</button>
                            <button type="button" onClick={() => setShowForm(false)} style={{
                                padding: "12px 24px", background: "white",
                                border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                fontSize: "14px", cursor: "pointer", color: "#64748b"
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {[
                    { label: "Total",      value: interviews.length,                                       color: "#6366f1" },
                    { label: "Scheduled",  value: interviews.filter(i => i.status === "scheduled").length, color: "#0ea5e9" },
                    { label: "Completed",  value: interviews.filter(i => i.status === "completed").length, color: "#22c55e" },
                    { label: "Passed",     value: interviews.filter(i => i.result === "pass").length,      color: "#16a34a" },
                ].map(s => (
                    <div key={s.label} style={{
                        background: "white", borderRadius: "12px",
                        padding: "20px", border: "1px solid #e2e8f0", textAlign: "center"
                    }}>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.value}</div>
                        <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Interviews list */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>Loading interviews...</div>
            ) : interviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                        No interviews scheduled
                    </h3>
                    <p>Schedule your first interview to get started</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {interviews.map(interview => (
                        <div key={interview._id} style={{
                            background: "white", borderRadius: "16px",
                            padding: "24px", border: "1px solid #e2e8f0"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "50%",
                                        background: "#eef2ff", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        color: "#6366f1", fontWeight: "800", fontSize: "18px"
                                    }}>
                                        {interview.application?.candidate?.personalInfo?.name?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                                            {interview.application?.candidate?.personalInfo?.name || "Unknown Candidate"}
                                        </h3>
                                        <p style={{ color: "#64748b", fontSize: "13px" }}>
                                            📅 {new Date(interview.date).toLocaleDateString()} at {interview.time} ·
                                            🎥 {interview.mode} · ⏱ {interview.duration} min
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{
                                        padding: "6px 14px", borderRadius: "20px",
                                        fontSize: "12px", fontWeight: "700",
                                        background: statusColor[interview.status]?.bg || "#f1f5f9",
                                        color: statusColor[interview.status]?.color || "#64748b"
                                    }}>{interview.status}</span>

                                    <span style={{
                                        padding: "6px 14px", borderRadius: "20px",
                                        fontSize: "12px", fontWeight: "700",
                                        background: resultColor[interview.result]?.bg || "#f1f5f9",
                                        color: resultColor[interview.result]?.color || "#64748b"
                                    }}>{interview.result}</span>
                                </div>
                            </div>

                            {interview.meetingLink && (
                                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: "inline-block", marginTop: "12px",
                                        padding: "8px 16px", background: "#eef2ff",
                                        color: "#6366f1", borderRadius: "8px",
                                        fontSize: "13px", fontWeight: "600"
                                    }}>
                                    🔗 Join Meeting
                                </a>
                            )}

                            {interview.status !== "completed" && (
                                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                    <button onClick={() => handleUpdateResult(interview._id, "pass")}
                                        style={{
                                            padding: "8px 20px", background: "#dcfce7",
                                            color: "#16a34a", border: "none",
                                            borderRadius: "8px", fontSize: "13px",
                                            fontWeight: "700", cursor: "pointer"
                                        }}>✓ Pass</button>
                                    <button onClick={() => handleUpdateResult(interview._id, "fail")}
                                        style={{
                                            padding: "8px 20px", background: "#fee2e2",
                                            color: "#dc2626", border: "none",
                                            borderRadius: "8px", fontSize: "13px",
                                            fontWeight: "700", cursor: "pointer"
                                        }}>✗ Fail</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Interviews