import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { jobsAPI } from "../../api/index"
import toast from "react-hot-toast"

const Jobs = () => {
    const [jobs,    setJobs]    = useState([])
    const [loading, setLoading] = useState(true)
    const [search,  setSearch]  = useState("")
    const [status,  setStatus]  = useState("")
    const navigate              = useNavigate()

    const fetchJobs = async () => {
        try {
            const res = await jobsAPI.getAll({ search, status })
            setJobs(res.data.jobs || [])
        } catch(err) {
            toast.error("Failed to fetch jobs")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchJobs() }, [search, status])

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this job?")) return
        try {
            await jobsAPI.delete(id)
            toast.success("Job deleted")
            fetchJobs()
        } catch(err) {
            toast.error("Failed to delete job")
        }
    }

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "open" ? "closed" : "open"
        try {
            await jobsAPI.toggleStatus(id, newStatus)
            toast.success(`Job ${newStatus}`)
            fetchJobs()
        } catch(err) {
            toast.error("Failed to update status")
        }
    }

    const statusColor = {
        open:    { bg: "#dcfce7", color: "#16a34a" },
        closed:  { bg: "#fee2e2", color: "#dc2626" },
        on_hold: { bg: "#fef3c7", color: "#d97706" }
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                        Job Postings
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        {jobs.filter(j => j.status === "open").length} open positions
                    </p>
                </div>
                <button onClick={() => navigate("/jobs/create")} style={{
                    padding: "12px 24px", background: "#6366f1",
                    color: "white", border: "none", borderRadius: "12px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer"
                }}>
                    + Post New Job
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, padding: "12px 16px",
                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                        fontSize: "14px", outline: "none"
                    }}
                />
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{
                        padding: "12px 16px", border: "1.5px solid #e2e8f0",
                        borderRadius: "12px", fontSize: "14px",
                        outline: "none", background: "white", cursor: "pointer"
                    }}
                >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="on_hold">On Hold</option>
                </select>
            </div>

            {/* Jobs grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#64748b" }}>Loading jobs...</div>
            ) : jobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>💼</div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#0f172a" }}>No jobs yet</h3>
                    <p style={{ marginBottom: "24px" }}>Create your first job posting to start hiring</p>
                    <button onClick={() => navigate("/jobs/create")} style={{
                        padding: "12px 24px", background: "#6366f1",
                        color: "white", border: "none", borderRadius: "12px",
                        fontSize: "14px", fontWeight: "700", cursor: "pointer"
                    }}>Create First Job</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                    {jobs.map(job => (
                        <div key={job._id} style={{
                            background: "white", borderRadius: "16px",
                            padding: "24px", border: "1px solid #e2e8f0",
                            cursor: "pointer", transition: "box-shadow 0.2s"
                        }}
                            onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", flex: 1, marginRight: "8px" }}>
                                    {job.title}
                                </h3>
                                <span style={{
                                    padding: "4px 10px", borderRadius: "20px",
                                    fontSize: "11px", fontWeight: "700", flexShrink: 0,
                                    background: statusColor[job.status]?.bg || "#f1f5f9",
                                    color: statusColor[job.status]?.color || "#64748b"
                                }}>{job.status}</span>
                            </div>

                            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "4px" }}>
                                {job.department} · {job.jobType} · {job.location}
                            </p>
                            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "16px" }}>
                                {job.experienceRequired}+ years experience
                            </p>

                            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>
                                {job.description?.substring(0, 100)}...
                            </p>

                            {/* Skills */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                                {job.requirements?.slice(0, 3).map(skill => (
                                    <span key={skill} style={{
                                        padding: "4px 10px", background: "#eef2ff",
                                        color: "#6366f1", borderRadius: "20px",
                                        fontSize: "11px", fontWeight: "600"
                                    }}>{skill}</span>
                                ))}
                            </div>

                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", paddingTop: "16px",
                                borderTop: "1px solid #f1f5f9"
                            }}>
                                <span style={{ color: "#64748b", fontSize: "12px" }}>
                                    👥 {job.applicantCount || 0} applicants
                                </span>
                                <div style={{ display: "flex", gap: "8px" }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => handleToggleStatus(job._id, job.status)} style={{
                                        padding: "6px 12px", background: "#f1f5f9",
                                        border: "none", borderRadius: "8px",
                                        fontSize: "12px", cursor: "pointer", color: "#64748b"
                                    }}>
                                        {job.status === "open" ? "Close" : "Open"}
                                    </button>
                                    <button onClick={() => handleDelete(job._id)} style={{
                                        padding: "6px 12px", background: "#fee2e2",
                                        border: "none", borderRadius: "8px",
                                        fontSize: "12px", cursor: "pointer", color: "#dc2626"
                                    }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Jobs