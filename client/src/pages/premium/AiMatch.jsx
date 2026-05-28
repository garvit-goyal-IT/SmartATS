import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Sparkles, Brain, ArrowRight, BarChart3, Briefcase, Users } from "lucide-react"
import { jobsAPI, applicationsAPI } from "../../api/index"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function AIMatch() {
    const [jobs,         setJobs]         = useState([])
    const [selectedJob,  setSelectedJob]  = useState(null)
    const [applications, setApplications] = useState([])
    const [loading,      setLoading]      = useState(true)
    const [loadingApps,  setLoadingApps]  = useState(false)
    const [query,        setQuery]        = useState("")
    const [filter,       setFilter]       = useState("All")
    const navigate = useNavigate()

    useEffect(() => {
        jobsAPI.getAll({ status: "open" }).then(res => {
            const j = res.data.jobs || []
            setJobs(j)
            if(j.length > 0) handleJobSelect(j[0])
        }).catch(() => toast.error("Failed to load jobs"))
          .finally(() => setLoading(false))
    }, [])

    const handleJobSelect = async (job) => {
        setSelectedJob(job)
        setLoadingApps(true)
        try {
            const res = await applicationsAPI.getByJob(job._id)
            setApplications(res.data.applications || [])
        } catch(err) {
            toast.error("Failed to load candidates")
        } finally {
            setLoadingApps(false)
        }
    }

    const handleShortlist = async (appId) => {
        try {
            await applicationsAPI.updateStatus(appId, { status: "shortlisted" })
            toast.success("Candidate shortlisted!")
            handleJobSelect(selectedJob)
        } catch(err) {
            toast.error("Failed to shortlist")
        }
    }

    const rankedCandidates = useMemo(() => {
        if(!selectedJob || !applications.length) return []

        const jobSkills = selectedJob.requirements?.map(s => s.toLowerCase()) || []

        return applications.map(app => {
            const pd = Array.isArray(app.candidate?.parsedData)
                ? app.candidate.parsedData[0]
                : app.candidate?.parsedData

            const candidateSkills = pd?.skills?.map(s => s.toLowerCase()) || []
            const overlap         = candidateSkills.filter(s => jobSkills.includes(s))
            const missingSkills   = selectedJob.requirements?.filter(s => !candidateSkills.includes(s.toLowerCase())) || []
            const fitScore        = app.fitScore || 0
            const strength        = fitScore >= 85 ? "Excellent" : fitScore >= 70 ? "Strong" : fitScore >= 55 ? "Good" : "Needs Review"

            return {
                _id:          app._id,
                candidateId:  app.candidate?._id,
                name:         app.candidate?.personalInfo?.name || "Unknown",
                role:         pd?.experience?.[0]?.title || "Candidate",
                location:     app.candidate?.personalInfo?.location || "—",
                fitScore,
                skills:       pd?.skills || [],
                experience:   pd?.totalExperience || 0,
                education:    pd?.education?.[0]?.degree || "—",
                status:       app.status,
                overlap:      overlap.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                missingSkills,
                strength,
                recommendation: app.aiAnalysis?.recommendation || "",
                scoreBreakdown: app.aiAnalysis?.scoreBreakdown || {},
                matchedSkills:  app.aiAnalysis?.matchedSkills || [],
            }
        })
        .filter(c => {
            const matchesQuery = !query ||
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.role.toLowerCase().includes(query.toLowerCase()) ||
                c.skills.join(" ").toLowerCase().includes(query.toLowerCase())
            const matchesFilter = filter === "All" || c.strength === filter
            return matchesQuery && matchesFilter
        })
        .sort((a, b) => b.fitScore - a.fitScore)
    }, [selectedJob, applications, query, filter])

    const topCandidate = rankedCandidates[0]

    if(loading) return (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            Loading...
        </div>
    )

    return (
        <div className="ai-match-page">
            <style>{styles}</style>
            <div className="wrap">

                {/* Hero */}
                <div className="hero">
                    <div>
                        <p className="eyebrow">AI Feature</p>
                        <h1>AI Candidate Matching</h1>
                        <p className="subtext">
                            Compare real candidates against job requirements and rank them using AI fit scores.
                        </p>
                    </div>
                    <div className="hero-badge">
                        <Brain size={18} /> Explainable AI Ranking
                    </div>
                </div>

                {/* Top grid */}
                <div className="top-grid">
                    {/* Job selector */}
                    <div className="panel job-panel">
                        <div className="panel-head">
                            <div>
                                <h2>Choose Job</h2>
                                <p>Select a role to rank candidates against it.</p>
                            </div>
                            <div className="job-count">
                                <Briefcase size={16} /> {jobs.length} Jobs
                            </div>
                        </div>
                        <div className="job-list">
                            {jobs.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                                    No open jobs found
                                </div>
                            ) : jobs.map(job => (
                                <button
                                    key={job._id}
                                    className={`job-item ${selectedJob?._id === job._id ? "active" : ""}`}
                                    onClick={() => handleJobSelect(job)}
                                >
                                    <div>
                                        <strong>{job.title}</strong>
                                        <span>{job.department} · {job.location}</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                        <span style={{ fontSize: "11px", color: "#f5c451" }}>
                                            {job.applicantCount || 0} applicants
                                        </span>
                                        <ArrowRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Top match */}
                    <div className="panel summary-panel">
                        <div className="panel-head">
                            <div>
                                <h2>Top Match</h2>
                                <p>Best AI-scored candidate for this job.</p>
                            </div>
                            <Sparkles size={18} className="gold" />
                        </div>

                        {loadingApps ? (
                            <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                                Loading candidates...
                            </div>
                        ) : topCandidate ? (
                            <div className="top-match-card">
                                <div className="top-row">
                                    <div>
                                        <h3>{topCandidate.name}</h3>
                                        <p>{topCandidate.role} · {topCandidate.location}</p>
                                    </div>
                                    <div className="score-circle">{topCandidate.fitScore}</div>
                                </div>

                                <div className="score-bar">
                                    <div style={{ width: `${topCandidate.fitScore}%` }} />
                                </div>

                                <div className="meta-grid">
                                    <Meta label="Experience"  value={`${topCandidate.experience} yrs`} />
                                    <Meta label="Education"   value={topCandidate.education} />
                                    <Meta label="Strength"    value={topCandidate.strength} />
                                    <Meta label="Skill Match" value={`${topCandidate.overlap.length}/${selectedJob?.requirements?.length || 0}`} />
                                </div>

                                {/* Score breakdown */}
                                {topCandidate.scoreBreakdown?.skillMatch && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {[
                                            { label: "Skill Match",      value: topCandidate.scoreBreakdown.skillMatch },
                                            { label: "Experience Match", value: topCandidate.scoreBreakdown.experienceMatch },
                                            { label: "Keyword Overlap",  value: topCandidate.scoreBreakdown.keywordOverlap },
                                        ].map(s => (
                                            <div key={s.label}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{s.label}</span>
                                                    <span style={{ fontSize: "11px", color: "#f5c451", fontWeight: "700" }}>{s.value}%</span>
                                                </div>
                                                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                                                    <div style={{ width: `${s.value}%`, height: "100%", background: "linear-gradient(90deg, #f5c451, #22c55e)", borderRadius: "999px" }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {topCandidate.recommendation && (
                                    <p className="explain">✨ {topCandidate.recommendation}</p>
                                )}

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button className="primary-btn" onClick={() => handleShortlist(topCandidate._id)}>
                                        Shortlist Candidate
                                    </button>
                                    <button className="ghost-btn" onClick={() => navigate(`/candidates/${topCandidate.candidateId}`)}>
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-box">
                                {applications.length === 0
                                    ? "No candidates have applied to this job yet."
                                    : "No candidates match the current filters."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="filter-row">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search candidate, role, or skills"
                        />
                    </div>
                    <div className="filter-box">
                        <Filter size={16} />
                        <select value={filter} onChange={e => setFilter(e.target.value)}>
                            <option>All</option>
                            <option>Excellent</option>
                            <option>Strong</option>
                            <option>Good</option>
                            <option>Needs Review</option>
                        </select>
                    </div>
                </div>

                {/* Main grid */}
                <div className="main-grid">
                    <div className="panel list-panel">
                        <div className="panel-head">
                            <div>
                                <h2>Ranked Candidates</h2>
                                <p>Sorted by AI fit score — highest first.</p>
                            </div>
                            <div className="small-pill">
                                <Users size={16} /> {rankedCandidates.length} candidates
                            </div>
                        </div>

                        {loadingApps ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                                Loading...
                            </div>
                        ) : (
                            <div className="candidate-list">
                                {rankedCandidates.length === 0 ? (
                                    <div className="empty-box">No candidates found for this job.</div>
                                ) : rankedCandidates.map((candidate, index) => (
                                    <div key={candidate._id} className="candidate-card">
                                        <div className="candidate-head">
                                            <div className="rank-pill">#{index + 1}</div>
                                            <div className="candidate-main">
                                                <div className="candidate-title-row">
                                                    <h3>{candidate.name}</h3>
                                                    <span className={`strength ${candidate.strength.toLowerCase().replace(/\s+/g, "-")}`}>
                                                        {candidate.strength}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "11px", padding: "3px 8px",
                                                        borderRadius: "20px", fontWeight: "700",
                                                        background: candidate.status === "shortlisted" ? "rgba(16,185,129,0.14)" : "rgba(255,255,255,0.06)",
                                                        color: candidate.status === "shortlisted" ? "#6ee7b7" : "#9ca3af"
                                                    }}>
                                                        {candidate.status?.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                                <p>{candidate.role} · {candidate.location}</p>
                                            </div>
                                            <div className="match-pill">{candidate.fitScore}</div>
                                        </div>

                                        <div className="skill-row">
                                            {candidate.matchedSkills.slice(0, 4).map(s => (
                                                <span key={s} style={{
                                                    padding: "6px 12px", borderRadius: "999px", fontSize: "12px",
                                                    fontWeight: "700", background: "rgba(16,185,129,0.14)", color: "#6ee7b7"
                                                }}>{s}</span>
                                            ))}
                                            {candidate.missingSkills.slice(0, 2).map(s => (
                                                <span key={s} style={{
                                                    padding: "6px 12px", borderRadius: "999px", fontSize: "12px",
                                                    fontWeight: "700", background: "rgba(248,113,113,0.14)", color: "#fca5a5"
                                                }}>{s}</span>
                                            ))}
                                        </div>

                                        {candidate.recommendation && (
                                            <p className="candidate-summary">
                                                ✨ {candidate.recommendation}
                                            </p>
                                        )}

                                        <div className="candidate-footer">
                                            <span>Matched: {candidate.overlap.length}</span>
                                            <span>Missing: {candidate.missingSkills.length}</span>
                                            <span>{candidate.experience} yrs exp</span>
                                            <div className="candidate-actions">
                                                <button
                                                    className="ghost-btn"
                                                    onClick={() => navigate(`/candidates/${candidate.candidateId}`)}
                                                >View</button>
                                                <button
                                                    className="primary-mini-btn"
                                                    onClick={() => handleShortlist(candidate._id)}
                                                    disabled={candidate.status === "shortlisted"}
                                                >
                                                    {candidate.status === "shortlisted" ? "Shortlisted ✓" : "Shortlist"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side panels */}
                    <div className="side-stack">
                        <div className="panel mini-panel">
                            <div className="panel-head">
                                <div>
                                    <h2>Required Skills</h2>
                                    <p>{selectedJob?.title || "Select a job"}</p>
                                </div>
                            </div>
                            <div className="chip-row">
                                {selectedJob?.requirements?.map(skill => (
                                    <span key={skill} className="chip">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="panel mini-panel">
                            <div className="panel-head">
                                <div>
                                    <h2>AI Insights</h2>
                                    <p>Ranking summary</p>
                                </div>
                                <BarChart3 size={18} className="gold" />
                            </div>
                            <div className="insight-list">
                                <InsightRow
                                    label="Top candidate"
                                    value={topCandidate?.name || "None"}
                                />
                                <InsightRow
                                    label="Avg fit score"
                                    value={rankedCandidates.length > 0
                                        ? `${Math.round(rankedCandidates.reduce((s, c) => s + c.fitScore, 0) / rankedCandidates.length)}/100`
                                        : "—"}
                                />
                                <InsightRow
                                    label="Shortlisted"
                                    value={`${rankedCandidates.filter(c => c.status === "shortlisted").length} candidates`}
                                />
                                <InsightRow
                                    label="Top missing skill"
                                    value={topCandidate?.missingSkills?.[0] || "None"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Meta({ label, value }) {
    return (
        <div className="meta-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    )
}

function InsightRow({ label, value }) {
    return (
        <div className="insight-row">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    )
}

const styles = `
  .ai-match-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 26%),
      radial-gradient(circle at 80% 10%, rgba(245,158,11,0.12), transparent 22%),
      #070b14;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .wrap { max-width: 1600px; margin: 0 auto; padding: 28px; }
  .hero { display: flex; justify-content: space-between; gap: 20px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 22px; }
  .eyebrow { margin: 0 0 10px; color: #f5c451; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
  h1 { margin: 0; font-size: clamp(28px, 4vw, 42px); line-height: 1.08; letter-spacing: -0.05em; }
  .subtext { margin: 12px 0 0; color: #9ca3af; font-size: 15px; line-height: 1.8; max-width: 780px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #e5e7eb; font-size: 13px; font-weight: 700; }
  .panel { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; box-shadow: 0 20px 45px rgba(0,0,0,0.18); backdrop-filter: blur(14px); padding: 20px; }
  .top-grid { display: grid; grid-template-columns: 1fr 1.05fr; gap: 18px; margin-bottom: 18px; }
  .panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
  .panel-head h2 { margin: 0; font-size: 18px; color: #fff; }
  .panel-head p { margin: 6px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6; }
  .gold { color: #f5c451; }
  .job-count, .small-pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #d1d5db; font-size: 12px; font-weight: 700; }
  .job-list { display: flex; flex-direction: column; gap: 10px; }
  .job-item { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #f8fafc; cursor: pointer; text-align: left; transition: 0.2s ease; }
  .job-item:hover, .job-item.active { transform: translateY(-1px); border-color: rgba(245,196,81,0.4); background: rgba(245,196,81,0.08); }
  .job-item strong { display: block; font-size: 14px; margin-bottom: 4px; }
  .job-item span { color: #9ca3af; font-size: 12px; }
  .top-match-card { display: flex; flex-direction: column; gap: 14px; }
  .top-row { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .top-row h3 { margin: 0; font-size: 22px; color: #fff; }
  .top-row p { margin: 6px 0 0; color: #9ca3af; font-size: 13px; }
  .score-circle, .match-pill { min-width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f5c451, #f59e0b); color: #111827; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; }
  .score-bar { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .score-bar div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #f5c451, #22c55e); }
  .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .meta-item { padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
  .meta-item span { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-item strong { display: block; font-size: 13px; line-height: 1.4; color: #f8fafc; }
  .explain { margin: 0; color: #cbd5e1; line-height: 1.8; font-size: 14px; }
  .primary-btn, .primary-mini-btn, .ghost-btn { border: none; border-radius: 14px; padding: 10px 16px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s ease; font-family: inherit; }
  .primary-btn, .primary-mini-btn { background: linear-gradient(135deg, #f5c451, #f59e0b); color: #111827; }
  .primary-mini-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ghost-btn { background: rgba(255,255,255,0.06); color: #f8fafc; border: 1px solid rgba(255,255,255,0.08); }
  .filter-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
  .search-box, .filter-box { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 13px 16px; color: #cbd5e1; }
  .search-box { flex: 1; min-width: 260px; }
  .search-box input, .filter-box select { border: none; outline: none; background: transparent; width: 100%; color: #fff; font-size: 14px; font-family: inherit; }
  .search-box input::placeholder { color: #94a3b8; }
  .main-grid { display: grid; grid-template-columns: 1.4fr 0.7fr; gap: 18px; align-items: start; }
  .candidate-list, .side-stack, .insight-list { display: flex; flex-direction: column; gap: 14px; }
  .candidate-card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 18px; }
  .mini-panel { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 18px; }
  .candidate-head { display: flex; align-items: flex-start; gap: 12px; justify-content: space-between; flex-wrap: wrap; }
  .rank-pill { min-width: 34px; height: 34px; border-radius: 12px; background: rgba(255,255,255,0.06); color: #f5c451; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; }
  .candidate-main { flex: 1; min-width: 180px; }
  .candidate-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .candidate-title-row h3 { margin: 0; color: #fff; font-size: 16px; }
  .strength { padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
  .strength.excellent { background: rgba(16,185,129,0.14); color: #6ee7b7; }
  .strength.strong { background: rgba(59,130,246,0.14); color: #93c5fd; }
  .strength.good { background: rgba(245,196,81,0.14); color: #f5c451; }
  .strength.needs-review { background: rgba(248,113,113,0.14); color: #fca5a5; }
  .candidate-main p { margin: 6px 0 0; color: #9ca3af; font-size: 13px; }
  .skill-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .candidate-summary { margin: 10px 0 0; color: #cbd5e1; font-size: 13px; line-height: 1.7; }
  .candidate-footer { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; color: #9ca3af; font-size: 13px; }
  .candidate-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .mini-panel h2 { margin: 0; font-size: 18px; color: #fff; }
  .mini-panel p { margin: 6px 0 0; color: #9ca3af; font-size: 13px; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip { padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #f8fafc; font-size: 13px; font-weight: 700; }
  .insight-row { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
  .insight-row span { color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  .insight-row strong { color: #f8fafc; font-size: 13px; line-height: 1.6; font-weight: 700; }
  .empty-box { padding: 40px 18px; text-align: center; color: #9ca3af; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); }
  @media (max-width: 1100px) { .top-grid, .main-grid { grid-template-columns: 1fr; } }
  @media (max-width: 800px) { .wrap { padding: 16px; } h1 { font-size: 28px; } .candidate-footer { align-items: flex-start; } }
`