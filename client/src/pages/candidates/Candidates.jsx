import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { candidatesAPI, jobsAPI, applicationsAPI } from "../../api/index"
import toast from "react-hot-toast"

const Candidates = () => {
    const [candidates, setCandidates] = useState([])
    const [jobs,       setJobs]       = useState([])
    const [loading,    setLoading]    = useState(true)
    const [uploading,  setUploading]  = useState(false)
    const [search,     setSearch]     = useState("")
    const [showUpload, setShowUpload] = useState(false)
    const [selectedJob, setSelectedJob] = useState("")
    const fileRef  = useRef()
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            const [cRes, jRes] = await Promise.all([
                candidatesAPI.getAll({ search }),
                jobsAPI.getAll({ status: "open" })
            ])
            setCandidates(cRes.data.candidates || [])
            setJobs(jRes.data.jobs || [])
        } catch(err) {
            toast.error("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [search])

    const handleUpload = async (e) => {
        e.preventDefault()
        const file = fileRef.current.files[0]
        if(!file) return toast.error("Please select a PDF file")
        if(!selectedJob) return toast.error("Please select a job")

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("resume", file)
            formData.append("jobId", selectedJob)

            const res = await candidatesAPI.upload(formData)
            const candidateId = res.data.candidate._id

            // create application with AI scoring
            await applicationsAPI.create({ candidateId, jobId: selectedJob })

            toast.success("Resume uploaded and AI scored!")
            setShowUpload(false)
            setSelectedJob("")
            fileRef.current.value = ""
            fetchData()
        } catch(err) {
            toast.error(err.response?.data?.message || "Upload failed")
        } finally {
            setUploading(false)
        }
    }
    const FitScoreBadge = ({ candidateId }) => {
        const [score, setScore] = useState(null)
    
        useEffect(() => {
            applicationsAPI.getByCandidate 
                ? applicationsAPI.getByCandidate(candidateId)
                    .then(res => {
                        const apps = res.data.applications || []
                        if(apps.length > 0) setScore(apps[0].fitScore)
                    })
                    .catch(() => {})
                : null
        }, [candidateId])
    
        if(score === null) return null
    
        return (
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: "12px",
                padding: "10px 14px", borderRadius: "10px",
                background: score >= 80 ? "#dcfce7" : score >= 60 ? "#fef3c7" : "#fee2e2"
            }}>
                <span style={{ fontSize: "13px", fontWeight: "600",
                    color: score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626"
                }}>
                    AI Fit Score
                </span>
                <span style={{ fontSize: "20px", fontWeight: "800",
                    color: score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626"
                }}>
                    {score}/100
                </span>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                        Candidates
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        {candidates.length} total candidates
                    </p>
                </div>
                <button onClick={() => setShowUpload(!showUpload)} style={{
                    padding: "12px 24px", background: "#6366f1",
                    color: "white", border: "none", borderRadius: "12px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer"
                }}>
                    + Upload Resume
                </button>
            </div>

            {/* Upload panel */}
            {showUpload && (
                <div style={{
                    background: "white", borderRadius: "16px",
                    padding: "28px", border: "1px solid #e2e8f0",
                    marginBottom: "24px"
                }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>
                        Upload Resume — AI will parse and score automatically
                    </h3>
                    <form onSubmit={handleUpload}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Select Job *
                                </label>
                                <select
                                    value={selectedJob}
                                    onChange={e => setSelectedJob(e.target.value)}
                                    style={{
                                        width: "100%", padding: "12px 16px",
                                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                        fontSize: "14px", outline: "none",
                                        background: "white", cursor: "pointer"
                                    }}
                                >
                                    <option value="">Select a job...</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                                    Resume PDF *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    ref={fileRef}
                                    style={{
                                        width: "100%", padding: "10px 16px",
                                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                        fontSize: "14px", cursor: "pointer"
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button type="submit" disabled={uploading} style={{
                                padding: "12px 24px", background: uploading ? "#a5b4fc" : "#6366f1",
                                color: "white", border: "none", borderRadius: "12px",
                                fontSize: "14px", fontWeight: "700",
                                cursor: uploading ? "not-allowed" : "pointer"
                            }}>
                                {uploading ? "Parsing resume with AI..." : "Upload & Parse →"}
                            </button>
                            <button type="button" onClick={() => setShowUpload(false)} style={{
                                padding: "12px 24px", background: "white",
                                border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                fontSize: "14px", cursor: "pointer", color: "#64748b"
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: "24px" }}>
                <input
                    placeholder="Search candidates..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: "100%", padding: "12px 16px",
                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                        fontSize: "14px", outline: "none"
                    }}
                />
            </div>

            {/* Candidates list */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#64748b" }}>Loading candidates...</div>
            ) : candidates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                        No candidates yet
                    </h3>
                    <p>Upload a resume to get started</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                    {candidates.map(c => (
                        <div key={c._id} style={{
                            background: "white", borderRadius: "16px",
                            padding: "24px", border: "1px solid #e2e8f0"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "50%",
                                    background: "#eef2ff", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    color: "#6366f1", fontWeight: "800", fontSize: "18px", flexShrink: 0
                                }}>
                                    {c.personalInfo?.name?.charAt(0) || "?"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" }}>
                                        {c.personalInfo?.name || "Unknown"}
                                    </h3>
                                    <p style={{ color: "#64748b", fontSize: "13px" }}>
                                        {c.personalInfo?.email || "No email"}
                                    </p>
                                </div>
                                {c.isDuplicate && (
                                    <span style={{
                                        padding: "4px 10px", background: "#fee2e2",
                                        color: "#dc2626", borderRadius: "20px",
                                        fontSize: "11px", fontWeight: "700"
                                    }}>Duplicate</span>
                                )}
                            </div>

                            {/* Info grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                                {[
                                    { icon: "📍", text: c.personalInfo?.location || "—" },
                                    { icon: "📞", text: c.personalInfo?.phone || "—" },
                                    { icon: "💼", text: `${c.parsedData?.totalExperience || 0} years exp` },
                                    { icon: "🎓", text: c.parsedData?.education?.[0]?.degree || "—" },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "center", gap: "6px",
                                        padding: "8px 12px", background: "#f8fafc",
                                        borderRadius: "8px", fontSize: "12px", color: "#64748b"
                                    }}>
                                        <span>{item.icon}</span>
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Skills */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                                {(Array.isArray(c.parsedData) ? c.parsedData[0]?.skills : c.parsedData?.skills)
                                    ?.slice(0, 4).map(skill => (
                                    <span key={skill} style={{
                                        padding: "4px 10px", background: "#eef2ff",
                                        color: "#6366f1", borderRadius: "20px",
                                        fontSize: "11px", fontWeight: "600"
                                    }}>{skill}</span>
                                ))}
                            </div>
                            <FitScoreBadge candidateId={c._id} />
                            <button
                                onClick={() => navigate(`/candidates/${c._id}`)}
                                style={{
                                    width: "100%", padding: "10px",
                                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                                    borderRadius: "10px", fontSize: "13px",
                                    fontWeight: "600", cursor: "pointer", color: "#374151"
                                }}
                            >
                                View Profile →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Candidates