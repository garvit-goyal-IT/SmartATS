import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  FileText,
  Briefcase,
  Users,
} from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Bangalore",
    skills: ["React", "TypeScript", "GraphQL", "Design Systems", "Performance"],
    description: "Build scalable interfaces for a premium ATS platform.",
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    skills: ["Python", "NLP", "LangChain", "FastAPI", "Vector Search"],
    description: "Build AI resume parsing and semantic matching pipeline.",
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "Mumbai",
    skills: ["Figma", "UX Research", "Design Systems", "Prototyping"],
    description: "Design the next generation of talent acquisition experiences.",
  },
];

const CANDIDATES = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Frontend Developer Intern",
    location: "Delhi",
    score: 94,
    skills: ["React", "JavaScript", "Tailwind", "Node.js", "HTML", "CSS"],
    experience: "1 Year",
    education: "B.Tech CSE",
    summary: "Strong frontend project experience and good React fundamentals.",
  },
  {
    id: 2,
    name: "Neha Verma",
    role: "Full Stack Developer",
    location: "Mumbai",
    score: 88,
    skills: ["MERN", "MongoDB", "Express", "React", "Redux"],
    experience: "2 Years",
    education: "B.Tech IT",
    summary: "Solid MERN profile with strong project ownership.",
  },
  {
    id: 3,
    name: "Kabir Malhotra",
    role: "Backend Developer",
    location: "Bangalore",
    score: 81,
    skills: ["Node.js", "Express", "MongoDB", "Docker", "REST APIs"],
    experience: "3 Years",
    education: "MCA",
    summary: "Backend strength is good, but frontend skill depth is limited.",
  },
  {
    id: 4,
    name: "Simran Kaur",
    role: "UI/UX Designer",
    location: "Pune",
    score: 76,
    skills: ["Figma", "UX Research", "Wireframing", "Prototyping"],
    experience: "2 Years",
    education: "B.Des",
    summary: "Excellent design portfolio, best suited for design roles.",
  },
  {
    id: 5,
    name: "Rohit Jain",
    role: "Software Engineer",
    location: "Delhi",
    score: 84,
    skills: ["React", "TypeScript", "Node.js", "AWS", "SQL"],
    experience: "2.5 Years",
    education: "B.Tech CSE",
    summary: "Balanced profile with strong full-stack foundations.",
  },
];

export default function AIMatch() {
  const [selectedJobId, setSelectedJobId] = useState(JOBS[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const selectedJob = JOBS.find((job) => job.id === selectedJobId) || JOBS[0];

  const rankedCandidates = useMemo(() => {
    const jobSkills = selectedJob.skills.map((s) => s.toLowerCase());

    return CANDIDATES.map((candidate) => {
      const candidateSkills = candidate.skills.map((s) => s.toLowerCase());
      const overlap = candidateSkills.filter((skill) => jobSkills.includes(skill));
      const matchPercent = Math.min(100, Math.round((overlap.length / jobSkills.length) * 100 + candidate.score * 0.15));
      const missingSkills = selectedJob.skills.filter((skill) => !candidateSkills.includes(skill.toLowerCase()));
      const strength =
        overlap.length >= 4
          ? "Excellent"
          : overlap.length >= 3
          ? "Strong"
          : overlap.length >= 2
          ? "Good"
          : "Needs Review";

      return {
        ...candidate,
        matchPercent,
        overlap,
        missingSkills,
        strength,
        explain:
          overlap.length > 0
            ? `Matches ${overlap.join(", ")} with the selected job.`
            : "Very limited direct skill overlap with this job.",
      };
    })
      .filter((c) => {
        const matchesQuery =
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.role.toLowerCase().includes(query.toLowerCase()) ||
          c.skills.join(" ").toLowerCase().includes(query.toLowerCase());

        const matchesFilter = filter === "All" || c.strength === filter;
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }, [selectedJob, query, filter]);

  const topCandidate = rankedCandidates[0];

  return (
    <div className="ai-match-page">
      <style>{styles}</style>

      <div className="wrap">
        <div className="hero">
          <div>
            <p className="eyebrow">Premium AI Feature</p>
            <h1>AI Candidate Matching</h1>
            <p className="subtext">
              Compare candidates against a job description and rank them using semantic skill overlap.
            </p>
          </div>

          <div className="hero-badge">
            <Brain size={18} /> Explainable AI Ranking
          </div>
        </div>

        <div className="top-grid">
          <div className="panel job-panel">
            <div className="panel-head">
              <div>
                <h2>Choose Job</h2>
                <p>Select a role to rank candidates against it.</p>
              </div>
              <div className="job-count">
                <Briefcase size={16} /> {JOBS.length} Jobs
              </div>
            </div>

            <div className="job-list">
              {JOBS.map((job) => (
                <button
                  key={job.id}
                  className={`job-item ${selectedJobId === job.id ? "active" : ""}`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <div>
                    <strong>{job.title}</strong>
                    <span>{job.department} · {job.location}</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="panel summary-panel">
            <div className="panel-head">
              <div>
                <h2>Top Match</h2>
                <p>Best candidate for the selected job.</p>
              </div>
              <Sparkles size={18} className="gold" />
            </div>

            {topCandidate ? (
              <div className="top-match-card">
                <div className="top-row">
                  <div>
                    <h3>{topCandidate.name}</h3>
                    <p>{topCandidate.role}</p>
                  </div>
                  <div className="score-circle">{topCandidate.matchPercent}%</div>
                </div>

                <div className="score-bar">
                  <div style={{ width: `${topCandidate.matchPercent}%` }} />
                </div>

                <div className="meta-grid">
                  <Meta label="Experience" value={topCandidate.experience} />
                  <Meta label="Education" value={topCandidate.education} />
                  <Meta label="Strength" value={topCandidate.strength} />
                  <Meta label="Overlap" value={topCandidate.overlap.length} />
                </div>

                <p className="explain">{topCandidate.explain}</p>
                <button className="primary-btn">Shortlist Candidate</button>
              </div>
            ) : (
              <div className="empty-box">No candidate matches found.</div>
            )}
          </div>
        </div>

        <div className="filter-row">
          <div className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidate, role, or skills"
            />
          </div>

          <div className="filter-box">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              <option>Excellent</option>
              <option>Strong</option>
              <option>Good</option>
              <option>Needs Review</option>
            </select>
          </div>
        </div>

        <div className="main-grid">
          <div className="panel list-panel">
            <div className="panel-head">
              <div>
                <h2>Ranked Candidates</h2>
                <p>Sorted by AI match score.</p>
              </div>
              <div className="small-pill">
                <Users size={16} /> {rankedCandidates.length} candidates
              </div>
            </div>

            <div className="candidate-list">
              {rankedCandidates.map((candidate, index) => (
                <CandidateCard key={candidate.id} candidate={candidate} rank={index + 1} />
              ))}
            </div>
          </div>

          <div className="side-stack">
            <div className="panel mini-panel">
              <div className="panel-head">
                <div>
                  <h2>Selected Job Skills</h2>
                  <p>{selectedJob.title}</p>
                </div>
              </div>
              <div className="chip-row">
                {selectedJob.skills.map((skill) => (
                  <span key={skill} className="chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="panel mini-panel">
              <div className="panel-head">
                <div>
                  <h2>AI Insight</h2>
                  <p>What the system learned</p>
                </div>
                <BarChart3 size={18} className="gold" />
              </div>
              <div className="insight-list">
                <InsightRow label="Best overlap" value={topCandidate?.overlap.join(", ") || "None"} />
                <InsightRow label="Likely shortlist" value={rankedCandidates.slice(0, 3).map((c) => c.name).join(", ")} />
                <InsightRow label="Mismatch trend" value={selectedJob.skills.find((skill) => !topCandidate?.overlap.includes(skill)) || "None"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, rank }) {
  return (
    <div className="candidate-card">
      <div className="candidate-head">
        <div className="rank-pill">#{rank}</div>
        <div className="candidate-main">
          <div className="candidate-title-row">
            <h3>{candidate.name}</h3>
            <span className={`strength ${candidate.strength.toLowerCase().replace(/\s+/g, "-")}`}>{candidate.strength}</span>
          </div>
          <p>{candidate.role} · {candidate.location}</p>
        </div>
        <div className="match-pill">{candidate.matchPercent}%</div>
      </div>

      <div className="skill-row">
        {candidate.skills.slice(0, 6).map((skill) => (
          <span key={skill} className="skill-chip">
            {skill}
          </span>
        ))}
      </div>

      <p className="candidate-summary">{candidate.summary}</p>

      <div className="candidate-footer">
        <span>Overlap: {candidate.overlap.length}</span>
        <span>Missing: {candidate.missingSkills.length}</span>
        <div className="candidate-actions">
          <button className="ghost-btn">View</button>
          <button className="primary-mini-btn">Shortlist</button>
        </div>
      </div>
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

function InsightRow({ label, value }) {
  return (
    <div className="insight-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
  .ai-match-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 26%),
      radial-gradient(circle at 80% 10%, rgba(245,158,11,0.12), transparent 22%),
      #070b14;
    color: #f8fafc;
    font-family: Inter, Arial, sans-serif;
  }

  .wrap {
    max-width: 1600px;
    margin: 0 auto;
    padding: 28px;
  }

  .hero {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: #f5c451;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0;
    font-size: 42px;
    line-height: 1.08;
    letter-spacing: -0.05em;
  }

  .subtext {
    margin: 12px 0 0;
    color: #9ca3af;
    font-size: 15px;
    line-height: 1.8;
    max-width: 780px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 999px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 700;
  }

  .panel {
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 28px;
    box-shadow: 0 20px 45px rgba(0,0,0,0.18);
    backdrop-filter: blur(14px);
    padding: 20px;
  }

  .top-grid {
    display: grid;
    grid-template-columns: 1fr 1.05fr;
    gap: 18px;
    margin-bottom: 18px;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .panel-head h2 {
    margin: 0;
    font-size: 18px;
    color: #fff;
  }

  .panel-head p {
    margin: 6px 0 0;
    color: #9ca3af;
    font-size: 13px;
    line-height: 1.6;
  }

  .gold {
    color: #f5c451;
  }

  .job-count,
  .small-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #d1d5db;
    font-size: 12px;
    font-weight: 700;
  }

  .job-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .job-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #f8fafc;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
  }

  .job-item:hover,
  .job-item.active {
    transform: translateY(-1px);
    border-color: rgba(245,196,81,0.4);
    background: rgba(245,196,81,0.08);
  }

  .job-item strong {
    display: block;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .job-item span {
    color: #9ca3af;
    font-size: 12px;
  }

  .top-match-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .top-row h3 {
    margin: 0;
    font-size: 22px;
    color: #fff;
  }

  .top-row p {
    margin: 6px 0 0;
    color: #9ca3af;
    font-size: 13px;
  }

  .score-circle,
  .match-pill {
    min-width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f5c451, #f59e0b);
    color: #111827;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 18px;
    box-shadow: 0 16px 30px rgba(245, 164, 11, 0.18);
  }

  .score-bar {
    height: 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }

  .score-bar div {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #f5c451, #22c55e);
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .meta-item {
    padding: 14px;
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }

  .meta-item span {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .meta-item strong {
    display: block;
    font-size: 13px;
    line-height: 1.4;
    color: #f8fafc;
  }

  .explain {
    margin: 0;
    color: #cbd5e1;
    line-height: 1.8;
    font-size: 14px;
  }

  .primary-btn,
  .primary-mini-btn,
  .ghost-btn {
    border: none;
    border-radius: 16px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: 0.2s ease;
    font-family: inherit;
  }

  .primary-btn,
  .primary-mini-btn {
    background: linear-gradient(135deg, #f5c451, #f59e0b);
    color: #111827;
  }

  .ghost-btn {
    background: rgba(255,255,255,0.06);
    color: #f8fafc;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .filter-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .search-box,
  .filter-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 13px 16px;
    color: #cbd5e1;
  }

  .search-box {
    flex: 1;
    min-width: 260px;
  }

  .search-box input,
  .filter-box select {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: #fff;
    font-size: 14px;
    font-family: inherit;
  }

  .search-box input::placeholder {
    color: #94a3b8;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1.4fr 0.7fr;
    gap: 18px;
    align-items: start;
  }

  .candidate-list,
  .side-stack,
  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .candidate-card,
  .mini-panel {
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 18px;
  }

  .candidate-head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .rank-pill {
    min-width: 34px;
    height: 34px;
    border-radius: 12px;
    background: rgba(255,255,255,0.06);
    color: #f5c451;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 13px;
  }

  .candidate-main {
    flex: 1;
    min-width: 220px;
  }

  .candidate-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .candidate-title-row h3 {
    margin: 0;
    color: #fff;
    font-size: 18px;
  }

  .strength {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .strength.excellent { background: rgba(16,185,129,0.14); color: #6ee7b7; }
  .strength.strong { background: rgba(59,130,246,0.14); color: #93c5fd; }
  .strength.good { background: rgba(245,196,81,0.14); color: #f5c451; }
  .strength.needs-review { background: rgba(248,113,113,0.14); color: #fca5a5; }

  .candidate-main p {
    margin: 6px 0 0;
    color: #9ca3af;
    font-size: 13px;
  }

  .skill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .skill-chip {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e5e7eb;
    font-size: 12px;
    font-weight: 700;
  }

  .candidate-summary {
    margin: 14px 0 0;
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.8;
  }

  .candidate-footer {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    color: #9ca3af;
    font-size: 13px;
  }

  .candidate-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .ghost-btn {
    padding: 10px 14px;
  }

  .mini-panel h2 {
    margin: 0;
    font-size: 18px;
    color: #fff;
  }

  .mini-panel p {
    margin: 6px 0 0;
    color: #9ca3af;
    font-size: 13px;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chip {
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: #f8fafc;
    font-size: 13px;
    font-weight: 700;
  }

  .insight-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }

  .insight-row span {
    color: #9ca3af;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .insight-row strong {
    color: #f8fafc;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 700;
  }

  .empty-box {
    padding: 40px 18px;
    text-align: center;
    color: #9ca3af;
    border-radius: 20px;
    border: 1px dashed rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
  }

  @media (max-width: 1100px) {
    .top-grid,
    .main-grid {
      grid-template-columns: 1fr;
    }

    .meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    .wrap {
      padding: 16px;
    }

    h1 {
      font-size: 32px;
    }

    .meta-grid,
    .stats-row {
      grid-template-columns: 1fr;
    }

    .candidate-footer {
      align-items: flex-start;
    }
  }
`;
