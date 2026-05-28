import React, { useMemo, useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Brain,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Wand2,
  Target,
  Cpu,
} from "lucide-react";
import { candidatesAPI, jobsAPI, applicationsAPI } from "../../api/index";
import toast from "react-hot-toast";

const workflowSteps = [
  { icon: Upload, label: "Upload", text: "Add a resume file" },
  { icon: Cpu, label: "Parse", text: "AI extracts details" },
  { icon: Target, label: "Match", text: "Compare with JD" },
  { icon: Wand2, label: "Recommend", text: "Show fit score" },
];

export default function ResumeAnalysis() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [analysis, setAnalysis] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState("")

  useEffect(() => {
    fetchCandidates();
  }, []);

  jobsAPI.getAll({ status: "open" }).then(res => {
    const j = res.data.jobs || []
    setJobs(j)
    if (j.length > 0) setSelectedJobId(j[0]._id)
  })

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidatesAPI.getAll();
      const cands = Array.isArray(res.data) ? res.data : res.data?.candidates ?? [];
      setCandidates(cands);
      if (cands.length > 0) selectCandidate(cands[0]);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const selectCandidate = async (candidate) => {
    const pd = Array.isArray(candidate.parsedData)
      ? candidate.parsedData[0]
      : candidate.parsedData

    const skills = pd?.skills || []
    const experience = pd?.totalExperience || 0

    // fetch real fit score from latest application
    let fitScore = 0
    let aiInsight = ""
    let recommendation = ""

    try {
      // get all jobs to find applications for this candidate
      const jobsRes = await jobsAPI.getAll()
      const jobs = jobsRes.data.jobs || []

      // check each job for an application by this candidate
      for (const job of jobs) {
        const appRes = await applicationsAPI.getByJob(job._id)
        const apps = appRes.data.applications || []
        const myApp = apps.find(a => a.candidate?._id === candidate._id)

        if (myApp) {
          fitScore = myApp.fitScore || 0
          aiInsight = myApp.aiAnalysis?.recommendation || ""
          recommendation = fitScore >= 75 ? "Shortlist for interview" : "Review candidate profile"
          break  // use first application found
        }
      }
    } catch (err) {
      console.error("Failed to fetch application score:", err)
    }

    setSelectedCandidate(candidate)
    setAnalysis({
      candidateName: candidate.personalInfo?.name || "Unknown",
      jobTitle: pd?.experience?.[0]?.title || "Candidate",
      matchScore: fitScore,
      fitLabel:
        fitScore >= 85 ? "Excellent Match" :
          fitScore >= 70 ? "Strong Match" :
            fitScore >= 50 ? "Good Match" : "Needs Review",
      experience: `${experience} Years`,
      education: pd?.education?.[0]?.degree || "Not specified",
      location: candidate.personalInfo?.location || "Not specified",
      extractedSkills: skills.slice(0, 8),
      missingSkills: [],
      keywords: candidate.keywords || [],
      strengths: [
        `${skills.length} relevant skills identified`,
        `${experience}+ years of experience`,
        fitScore > 0 ? `AI fit score: ${fitScore}/100` : "Profile reviewed by AI"
      ],
      recommendation: recommendation || (fitScore >= 75 ? "Shortlist for interview" : "Review candidate profile"),
      summary: aiInsight || "Candidate profile analyzed by AI system.",
      parsedResume: candidate.resumeText || "Resume text not available",
      aiInsight: aiInsight || "Upload resume and apply to a job to get AI insights."
    })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!selectedJobId) return toast.error("Please select a job first")

      console.log("Uploading with jobId:", selectedJobId) // ← add this
      console.log("File:", file.name) // ← add this
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("jobId", selectedJobId)
      formData.append("resume", file)
    
      console.log("FormData jobId:", formData.get("jobId"))

      const res = await candidatesAPI.upload(formData, selectedJobId)
      const newCandidate = res.data?.candidate

      // create application to get AI score
      if (newCandidate?._id) {
        const appRes = await applicationsAPI.create({
          candidateId: newCandidate._id,
          jobId: selectedJobId
        })
        // merge fit score into candidate
        newCandidate.score = appRes.data.application?.fitScore || 0
        newCandidate.aiInsight = appRes.data.aiAnalysis?.recommendation || ""
      }

      toast.success("Resume uploaded and AI scored!")
      await fetchCandidates()
      if (newCandidate) selectCandidate(newCandidate)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload")
    } finally {
      setUploading(false)
    }
  }

  const skillList = useMemo(() => analysis?.extractedSkills || [], [analysis]);

  if (loading) {
    return (
      <div className="resume-page">
        <style>{styles}</style>
        <div className="state-msg">Loading candidates...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="resume-page">
        <style>{styles}</style>
        <div className="state-msg">No candidates available</div>
      </div>
    );
  }

  return (
    <div className="resume-page">
      <style>{styles}</style>

      <div className="resume-wrapper">
        {/* Hero */}
        <div className="hero-panel">
          <div className="hero-text">
            <p className="eyebrow">Premium AI Feature</p>
            <h1>Resume Parsing &amp; AI Analysis</h1>
            <p className="subtitle">
              Upload a resume, extract details automatically, and get a candidate fit score with explainable AI insights.
            </p>
          </div>

          <div className="hero-badges">
            <span className="hero-badge gold">AI Powered</span>
            <span className="hero-badge">Premium</span>
            <span className="hero-badge">Explainable Score</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="mini-stat"><p>Fit Score</p><h3>{analysis.matchScore}%</h3></div>
          <div className="mini-stat"><p>Extracted Skills</p><h3>{analysis.extractedSkills.length}</h3></div>
          <div className="mini-stat"><p>Keywords Found</p><h3>{analysis.keywords.length}</h3></div>
          <div className="mini-stat"><p>Total Candidates</p><h3>{candidates.length}</h3></div>
        </div>

        {/* Workflow */}
        <div className="workflow-strip">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <div className="workflow-card">
                  <div className="workflow-icon"><Icon size={18} /></div>
                  <strong>{step.label}</strong>
                  <span>{step.text}</span>
                </div>
                {index < workflowSteps.length - 1 && <div className="workflow-line" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Upload & Score */}
        <div className="top-grid">
          {/* Upload Card */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#9ca3af", marginBottom: "8px" }}>
              Select Job Position
            </label>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px", color: "#fff",
                fontSize: "14px", outline: "none"
              }}
            >
              <option value="">Select job...</option>
              {jobs.map(j => <option key={j._id} value={j._id} style={{ background: "#0f172a" }}>{j.title}</option>)}
            </select>
          </div>
          <div className="glass-card upload-card">
            <div className="card-head">
              <div className="card-icon gold"><Upload size={20} /></div>
              <div>
                <h2>Upload Resume</h2>
                <p>Drag and drop or attach a PDF / DOC file</p>
              </div>
            </div>

            <div className="upload-box">
              <FileText size={28} />
              <h3>Drop resume here</h3>
              <p>AI will parse skills, experience, education, and keywords.</p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <button
                className="primary-btn"
                onClick={() => document.getElementById("file-input").click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Choose File"}
              </button>
            </div>
          </div>

          {/* Score Card */}
          <div className="glass-card score-card">
            <div className="score-top">
              <div>
                <p className="small-label">Candidate Fit Score</p>
                <h2>{analysis.matchScore}%</h2>
              </div>
              <span className="fit-pill">{analysis.fitLabel}</span>
            </div>

            <div className="score-bar">
              <div style={{ width: `${analysis.matchScore}%` }} />
            </div>

            <div className="score-meta">
              <Meta label="Candidate" value={analysis.candidateName} />
              <Meta label="Role" value={analysis.jobTitle} />
              <Meta label="Experience" value={analysis.experience} />
              <Meta label="Education" value={analysis.education} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parsed details"
            />
          </div>

          <div className="filter-box">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              <option>Skills</option>
              <option>Keywords</option>
              <option>Summary</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-grid">
          <div className="left-column">
            <Section title="Extracted Skills" icon={BadgeCheck} accent="green">
              <div className="chip-row">
                {skillList
                  .filter((skill) =>
                    skill.toLowerCase().includes(search.toLowerCase()) ||
                    filter === "All" || filter === "Skills"
                  )
                  .map((skill) => (
                    <span key={skill} className="chip success">{skill}</span>
                  ))}
              </div>
            </Section>

            <Section title="Keywords" icon={Sparkles} accent="gold">
              <div className="chip-row">
                {analysis.keywords
                  .filter((keyword) =>
                    keyword.toLowerCase().includes(search.toLowerCase()) ||
                    filter === "All" || filter === "Keywords"
                  )
                  .map((keyword) => (
                    <span key={keyword} className="chip neutral">{keyword}</span>
                  ))}
              </div>
            </Section>

            <Section title="Summary & Strengths" icon={Brain} accent="blue">
              <p className="text-block">{analysis.summary}</p>
              <div className="strength-list">
                {analysis.strengths.map((item) => (
                  <div className="strength-item" key={item}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="right-column">
            <div className="glass-card analysis-card">
              <div className="card-head">
                <div className="card-icon purple"><FileText size={20} /></div>
                <div>
                  <h2>Parsed Resume</h2>
                  <p>Extracted text from the document</p>
                </div>
              </div>
              <div className="resume-preview">
                <pre>{analysis.parsedResume.slice(0, 800)}...</pre>
              </div>
            </div>

            <div className="glass-card analysis-card recommend-card">
              <div className="card-head">
                <div className="card-icon gold"><ShieldCheck size={20} /></div>
                <div>
                  <h2>AI Recommendation</h2>
                  <p>Explainable result based on profile</p>
                </div>
              </div>
              <div className="recommendation-box">
                <div className="recommendation-heading">
                  <BarChart3 size={18} />
                  <strong>{analysis.recommendation}</strong>
                </div>
                <p>{analysis.aiInsight}</p>
                <button className="secondary-btn">
                  Send to Pipeline <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, accent, children }) {
  return (
    <div className="section-card">
      <div className="section-head">
        <div className="section-title">
          <div className={`section-icon ${accent || ""}`}>
            <Icon size={16} />
          </div>
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; }

  .resume-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 30%),
      radial-gradient(circle at 80% 10%, rgba(245,158,11,0.12), transparent 24%),
      #070b14;
    color: #f8fafc;
    font-family: Inter, Arial, sans-serif;
    overflow-x: hidden;
  }

  .state-msg {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-size: 16px;
    padding: 24px;
    text-align: center;
  }

  .resume-wrapper {
    max-width: 1600px;
    margin: 0 auto;
    padding: clamp(14px, 3vw, 28px);
    width: 100%;
  }

  .hero-panel {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .hero-text { min-width: 0; flex: 1 1 320px; }

  .eyebrow {
    margin: 0 0 10px;
    color: #f5c451;
    font-size: clamp(11px, 1.4vw, 14px);
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(26px, 4.6vw, 42px);
    line-height: 1.1;
    letter-spacing: -0.04em;
    word-break: break-word;
  }

  .subtitle {
    margin: 12px 0 0;
    color: #9ca3af;
    font-size: clamp(13px, 1.6vw, 15px);
    line-height: 1.7;
    max-width: 820px;
  }

  .hero-badges { display: flex; gap: 10px; flex-wrap: wrap; }

  .hero-badge {
    padding: 9px 13px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #d1d5db;
    font-size: 12px;
    font-weight: 700;
  }
  .hero-badge.gold {
    background: rgba(245,196,81,0.12);
    border-color: rgba(245,196,81,0.25);
    color: #f5c451;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .mini-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: clamp(14px, 2vw, 20px);
    backdrop-filter: blur(12px);
    min-width: 0;
  }
  .mini-stat p {
    margin: 0;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .mini-stat h3 {
    margin: 10px 0 0;
    font-size: clamp(20px, 3vw, 26px);
    color: #f8fafc;
  }

  .workflow-strip {
    display: flex;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 22px;
    overflow-x: auto;
    padding-bottom: 6px;
    -webkit-overflow-scrolling: touch;
  }

  .workflow-card {
    min-width: 170px;
    flex: 0 0 auto;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    backdrop-filter: blur(10px);
  }

  .workflow-icon {
    width: 38px; height: 38px;
    border-radius: 14px;
    background: rgba(245,196,81,0.12);
    color: #f5c451;
    display: flex; align-items: center; justify-content: center;
  }
  .workflow-card strong { font-size: 14px; color: #fff; }
  .workflow-card span { font-size: 13px; color: #9ca3af; line-height: 1.5; }

  .workflow-line {
    width: 28px; flex: 0 0 28px;
    border-bottom: 1px dashed rgba(255,255,255,0.12);
    align-self: center;
  }

  .top-grid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 22px;
    margin-bottom: 22px;
  }

  .glass-card, .section-card {
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    box-shadow: 0 20px 45px rgba(0,0,0,0.18);
    backdrop-filter: blur(14px);
    min-width: 0;
  }

  .upload-card, .score-card, .analysis-card { padding: clamp(16px, 2.2vw, 22px); }

  .card-head { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
  .card-head > div { min-width: 0; }
  .card-head h2, .section-head h3, .recommendation-box strong { margin: 0; color: #fff; }
  .card-head h2 { font-size: clamp(17px, 2.2vw, 22px); }
  .card-head p { margin: 6px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6; }

  .card-icon {
    width: 46px; height: 46px;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.06);
    color: #cbd5e1;
  }
  .card-icon.gold { background: rgba(245,196,81,0.14); color: #f5c451; }
  .card-icon.purple { background: rgba(124,58,237,0.16); color: #c4b5fd; }
  .card-icon.green { background: rgba(16,185,129,0.14); color: #6ee7b7; }

  .upload-box {
    margin-top: 22px;
    min-height: 240px;
    border-radius: 22px;
    border: 1px dashed rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.03);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px 16px;
    gap: 10px;
  }
  .upload-box h3 { margin: 6px 0 0; font-size: clamp(16px, 2vw, 20px); color: #fff; }
  .upload-box p { margin: 0; color: #9ca3af; max-width: 360px; line-height: 1.7; font-size: 14px; }

  .primary-btn, .secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.2s ease;
    font-family: inherit;
    max-width: 100%;
  }
  .primary-btn { background: linear-gradient(135deg, #f5c451, #f59e0b); color: #111827; }
  .secondary-btn {
    background: rgba(255,255,255,0.06);
    color: #f8fafc;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .primary-btn:hover, .secondary-btn:hover { transform: translateY(-1px); }
  .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .score-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .small-label {
    margin: 0; font-size: 12px; color: #9ca3af;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .score-top h2 { margin: 10px 0 0; font-size: clamp(32px, 5vw, 44px); line-height: 1; }

  .fit-pill {
    background: rgba(16,185,129,0.14);
    color: #6ee7b7;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    border: 1px solid rgba(16,185,129,0.22);
  }

  .score-bar {
    height: 14px;
    background: rgba(255,255,255,0.06);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 20px;
  }
  .score-bar div {
    height: 100%;
    background: linear-gradient(90deg, #f5c451, #22c55e);
    border-radius: 999px;
  }

  .score-meta {
    margin-top: 22px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .meta-item {
    padding: 14px;
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    min-width: 0;
  }
  .meta-item span {
    display: block; font-size: 11px; color: #9ca3af;
    margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .meta-item strong {
    display: block; font-size: 13px; line-height: 1.4; color: #f8fafc;
    word-break: break-word;
  }

  .filter-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 22px; }

  .search-box, .filter-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 12px 14px;
    color: #cbd5e1;
    min-width: 0;
  }
  .search-box { flex: 1 1 260px; }
  .filter-box { flex: 0 1 200px; }

  .search-box input, .filter-box select {
    border: none; outline: none; background: transparent;
    font-size: 14px; width: 100%; font-family: inherit; color: #fff;
    min-width: 0;
  }
  .filter-box select option { background: #0f172a; color: #fff; }
  .search-box input::placeholder { color: #94a3b8; }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 0.9fr;
    gap: 22px;
    align-items: start;
  }

  .left-column, .right-column {
    display: flex; flex-direction: column; gap: 18px; min-width: 0;
  }

  .section-card { padding: clamp(16px, 2vw, 20px); }

  .section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; gap: 10px; flex-wrap: wrap;
  }
  .section-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .section-title h3 { margin: 0; font-size: clamp(15px, 1.8vw, 18px); color: #fff; }

  .section-icon {
    width: 34px; height: 34px;
    border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    color: #cbd5e1; flex-shrink: 0;
  }
  .section-icon.green { color: #6ee7b7; }
  .section-icon.red { color: #fca5a5; }
  .section-icon.gold { color: #f5c451; }
  .section-icon.blue { color: #93c5fd; }

  .chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip {
    padding: 9px 13px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    word-break: break-word;
  }
  .chip.success { background: rgba(16,185,129,0.14); color: #6ee7b7; }
  .chip.neutral { background: rgba(99,102,241,0.16); color: #c7d2fe; }

  .text-block { margin: 0; color: #cbd5e1; line-height: 1.8; font-size: 14px; }

  .strength-list { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
  .strength-item {
    display: flex; align-items: flex-start; gap: 10px;
    color: #d1d5db; font-size: 14px; line-height: 1.6;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .strength-item svg { flex-shrink: 0; margin-top: 2px; color: #6ee7b7; }

  .resume-preview {
    margin-top: 18px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.18);
    padding: 16px;
    overflow: auto;
    max-height: 300px;
  }
  .resume-preview pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: inherit;
    color: #d1d5db;
    line-height: 1.7;
    font-size: 13px;
    word-break: break-word;
  }

  .recommendation-box {
    margin-top: 18px;
    border-radius: 18px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    padding: 18px;
  }
  .recommendation-heading { display: flex; align-items: center; gap: 10px; color: #f8fafc; flex-wrap: wrap; }
  .recommendation-box p { margin: 12px 0 0; color: #cbd5e1; line-height: 1.7; font-size: 14px; }
  .recommendation-box .secondary-btn { margin-top: 16px; }

  .recommend-card { border: 1px solid rgba(245,196,81,0.18); }

  /* ---------- Responsive Breakpoints ---------- */

  @media (max-width: 1100px) {
    .top-grid, .main-grid { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 780px) {
    .hero-panel { align-items: flex-start; }
    .hero-badges { width: 100%; }
    .score-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .filter-row { flex-direction: column; }
    .search-box, .filter-box { width: 100%; flex: 1 1 auto; }
  }

  @media (max-width: 560px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
    .score-meta { grid-template-columns: 1fr; }
    .workflow-line { display: none; }
    .workflow-card { min-width: 150px; }
    .primary-btn, .secondary-btn { width: 100%; }
    .upload-box { min-height: 200px; padding: 20px 12px; }
    .glass-card, .section-card { border-radius: 18px; }
  }

  @media (max-width: 380px) {
    .stats-row { grid-template-columns: 1fr; }
    .hero-badge { font-size: 11px; padding: 7px 10px; }
  }
`;
