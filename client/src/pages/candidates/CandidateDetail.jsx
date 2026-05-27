import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { candidatesAPI, applicationsAPI } from "../../api/index"
import toast from "react-hot-toast"
import { aiAPI } from "../../api/index"

const CandidateDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [candidate, setCandidate] = useState(null)
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [questions, setQuestions] = useState([])
    const [loadingQ, setLoadingQ] = useState(false)
    const [appId, setAppId] = useState(null)

    const handleGenerateQuestions = async () => {
        if (!appId) return toast.error("No application found for this candidate")
        setLoadingQ(true)
        try {
            const res = await aiAPI.generateQuestions(appId)
            setQuestions(res.data.questions)
            toast.success("Interview questions generated!")
        } catch (err) {
            toast.error("Failed to generate questions")
        } finally {
            setLoadingQ(false)
        }
    }

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await candidatesAPI.getById(id)
                setCandidate(res.data.candidate)
            } catch (err) {
                toast.error("Candidate not found")
                navigate("/candidates")
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [id])


    if (loading) return (
        <div style={{ textAlign: "center", padding: "64px", color: "#64748b" }}>Loading...</div>
    )

    if (!candidate) return null

    const parsedData = Array.isArray(candidate.parsedData)
        ? candidate.parsedData[0]
        : candidate.parsedData;

    return (
        <div style={{ maxWidth: "900px" }}>
            <button onClick={() => navigate("/candidates")} style={{
                background: "none", border: "none", color: "#6366f1",
                fontSize: "14px", cursor: "pointer", marginBottom: "24px",
                padding: 0, fontWeight: "600"
            }}>← Back to Candidates</button>

            {/* Profile header */}
            <div style={{
                background: "white", borderRadius: "16px",
                padding: "32px", border: "1px solid #e2e8f0", marginBottom: "20px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
                    <div style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        background: "#eef2ff", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "#6366f1", fontWeight: "800", fontSize: "28px"
                    }}>
                        {candidate.personalInfo?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                            {candidate.personalInfo?.name || "Unknown"}
                        </h1>
                        <p style={{ color: "#64748b", fontSize: "14px" }}>
                            {parsedData?.experience?.[0]?.title || "Candidate"}
                        </p>
                    </div>
                    {candidate.isDuplicate && (
                        <span style={{
                            marginLeft: "auto", padding: "6px 14px",
                            background: "#fee2e2", color: "#dc2626",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "700"
                        }}>⚠️ Duplicate Detected</span>
                    )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                    {[
                        { icon: "✉️", label: "Email", value: candidate.personalInfo?.email },
                        { icon: "📞", label: "Phone", value: candidate.personalInfo?.phone },
                        { icon: "📍", label: "Location", value: candidate.personalInfo?.location },
                        { icon: "💼", label: "Experience", value: `${parsedData?.totalExperience || 0} years` },
                    ].map(item => (
                        <div key={item.label} style={{
                            padding: "16px", background: "#f8fafc",
                            borderRadius: "12px", textAlign: "center"
                        }}>
                            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{item.icon}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>{item.label}</div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                                {item.value || "—"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                {/* Skills */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                        Skills
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {parsedData?.skills?.map(skill => (
                            <span key={skill} style={{
                                padding: "6px 14px", background: "#eef2ff",
                                color: "#6366f1", borderRadius: "20px",
                                fontSize: "12px", fontWeight: "600"
                            }}>{skill}</span>
                        ))}
                    </div>
                </div>

                {/* Keywords */}
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                        AI Keywords
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {candidate.keywords?.map(kw => (
                            <span key={kw} style={{
                                padding: "6px 14px", background: "#f0fdf4",
                                color: "#16a34a", borderRadius: "20px",
                                fontSize: "12px", fontWeight: "600"
                            }}>{kw}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Experience */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>
                    Work Experience
                </h3>
                {parsedData?.experience?.map((exp, i) => (
                    <div key={i} style={{
                        paddingBottom: "20px", marginBottom: "20px",
                        borderBottom: i < parsedData.experience.length - 1 ? "1px solid #f1f5f9" : "none"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                                    {exp.title}
                                </h4>
                                <p style={{ color: "#6366f1", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                                    {exp.company}
                                </p>
                                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>
                                    {exp.description}
                                </p>
                            </div>
                            <span style={{
                                padding: "4px 12px", background: "#f1f5f9",
                                borderRadius: "20px", fontSize: "12px",
                                color: "#64748b", flexShrink: 0, marginLeft: "16px"
                            }}>{exp.duration}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Education */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>
                    Education
                </h3>
                {parsedData?.education?.map((edu, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{edu.degree}</h4>
                            <p style={{ color: "#64748b", fontSize: "13px" }}>{edu.institution}</p>
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>{edu.year}</span>
                    </div>
                ))}
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                            AI Interview Questions
                        </h3>
                        <p style={{ color: "#64748b", fontSize: "13px" }}>
                            Generated based on job requirements and candidate profile
                        </p>
                    </div>
                    <button onClick={handleGenerateQuestions} disabled={loadingQ} style={{
                        padding: "10px 20px", background: loadingQ ? "#a5b4fc" : "#6366f1",
                        color: "white", border: "none", borderRadius: "10px",
                        fontSize: "13px", fontWeight: "700", cursor: loadingQ ? "not-allowed" : "pointer"
                    }}>
                        {loadingQ ? "Generating..." : "⚡ Generate Questions"}
                    </button>
                </div>

                {questions.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {questions.map((q, i) => (
                            <div key={i} style={{
                                padding: "16px", background: "#f8fafc",
                                borderRadius: "12px", border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{
                                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                                        background: q.type === "technical" ? "#eef2ff" : q.type === "behavioral" ? "#f0fdf4" : "#fef3c7",
                                        color: q.type === "technical" ? "#6366f1" : q.type === "behavioral" ? "#16a34a" : "#d97706"
                                    }}>{q.type}</span>
                                    <span style={{
                                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                                        background: q.difficulty === "hard" ? "#fee2e2" : q.difficulty === "medium" ? "#fef3c7" : "#dcfce7",
                                        color: q.difficulty === "hard" ? "#dc2626" : q.difficulty === "medium" ? "#d97706" : "#16a34a"
                                    }}>{q.difficulty}</span>
                                </div>
                                <p style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px", marginBottom: "6px" }}>
                                    {i + 1}. {q.question}
                                </p>
                                <p style={{ color: "#64748b", fontSize: "12px" }}>
                                    💡 {q.purpose}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

    )
}

export default CandidateDetail