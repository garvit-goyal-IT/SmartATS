import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    BadgeIndianRupee,
    CalendarDays,
    Users,
    ShieldCheck,
    Sparkles,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Send,
    Eye,
    Pencil,
    CircleDot,
    ClipboardList,
} from "lucide-react";

const DEMO_JOB = {
    id: 1,
    title: "Senior Frontend Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Bangalore, India",
    status: "Active",
    salary: "₹18L - ₹28L / year",
    deadline: "2025-07-15",
    applicants: 47,
    description:
        "Build world-class interfaces for our ATS platform used by 500+ companies. Work with product, design, and backend teams to deliver polished, scalable experiences.",
    requirements:
        "5+ years experience, strong React, TypeScript, CSS architecture, component design systems, and product mindset.",
    skills: ["React", "TypeScript", "GraphQL", "Design Systems", "Performance"],
};

const DEMO_APPLICANTS = [
    {
        id: 1,
        name: "Aarav Sharma",
        role: "Frontend Developer Intern",
        score: 92,
        stage: "Applied",
        email: "aarav@gmail.com",
        location: "Delhi",
        summary: "Strong React and JavaScript fundamentals with good UI project experience.",
    },
    {
        id: 2,
        name: "Neha Verma",
        role: "Full Stack Developer",
        score: 86,
        stage: "Shortlisted",
        email: "neha@gmail.com",
        location: "Mumbai",
        summary: "Solid MERN profile and good project ownership.",
    },
    {
        id: 3,
        name: "Kabir Malhotra",
        role: "Backend Developer",
        score: 79,
        stage: "Interview",
        email: "kabir@gmail.com",
        location: "Bangalore",
        summary: "Good Node.js and API design knowledge.",
    },
    {
        id: 4,
        name: "Simran Kaur",
        role: "UI Engineer",
        score: 88,
        stage: "Screening",
        email: "simran@gmail.com",
        location: "Pune",
        summary: "Strong portfolio and responsive UI work.",
    },
];

const stageMeta = {
    Applied: { bg: "#EFF6FF", color: "#1D4ED8", icon: CircleDot },
    Screening: { bg: "#FFFBEB", color: "#B45309", icon: ClipboardList },
    Shortlisted: { bg: "#F3E8FF", color: "#7C3AED", icon: Sparkles },
    Interview: { bg: "#ECFDF5", color: "#047857", icon: CalendarDays },
    Offer: { bg: "#FFF7ED", color: "#C2410C", icon: ShieldCheck },
    Hired: { bg: "#DCFCE7", color: "#166534", icon: CheckCircle2 },
    Rejected: { bg: "#FEF2F2", color: "#B91C1C", icon: XCircle },
};

export default function JobDetail() {
    const navigate = useNavigate();
    const { jobId } = useParams();

    const job = DEMO_JOB;
    const [tab, setTab] = useState("overview");
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState("All");
    const [showEdit, setShowEdit] = useState(false);
    const [jobData, setJobData] = useState(job);
    const [editForm, setEditForm] = useState({
        title: job.title || "",
        department: job.department || "",
        type: job.type || "",
        location: job.location || "",
        description: job.description || "",
        requirements: job.requirements || "",
        skills: Array.isArray(job.skills) ? job.skills.join(", ") : (job.skills || ""),
        minSalary: job.minSalary || "",
        maxSalary: job.maxSalary || "",
        deadline: job.deadline || "",
        status: job.status || "Active",
    });

    const filteredApplicants = useMemo(() => {
        return DEMO_APPLICANTS.filter((app) => {
            const matchesSearch =
                app.name.toLowerCase().includes(search.toLowerCase()) ||
                app.role.toLowerCase().includes(search.toLowerCase()) ||
                app.email.toLowerCase().includes(search.toLowerCase());
            const matchesStage = stageFilter === "All" || app.stage === stageFilter;
            return matchesSearch && matchesStage;
        });
    }, [search, stageFilter]);

    const tabs = [
        { id: "overview", label: "Overview", icon: Briefcase },
        { id: "applicants", label: "Applicants", icon: Users },
        { id: "ai", label: "AI Insights", icon: Sparkles },
    ];

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpdateJob = async () => {
        try {
            const payload = {
                ...editForm,
                skills: editForm.skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            };

            setJobData((prev) => ({
                ...prev,
                ...payload,
                skills: payload.skills,
            }));

            setShowEdit(false);
        } catch (err) {
            console.log(err);
            alert("Failed to update job");
        }
    };

    return (
        <div className="job-details-page">
            <style>{styles}</style>

            <div className="job-details-wrapper">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back to jobs
                </button>

                <div className="hero-card">
                    <div className="hero-left">
                        <div className="title-row">
                            <div>
                                <p className="eyebrow">Job Details</p>
                                <h1>{jobData.title}</h1>
                                <p className="subtext">{jobData.department} · {jobData.type} · {jobData.location}</p>
                            </div>
                            <StatusBadge status={jobData.status} />
                        </div>

                        <div className="quick-facts">
                            <Fact icon={Users} label="Applicants" value={jobData.applicants} />
                            <Fact icon={BadgeIndianRupee} label="Salary" value={jobData.salary} />
                            <Fact icon={CalendarDays} label="Deadline" value={jobData.deadline} />
                            <Fact icon={MapPin} label="Location" value={jobData.location} />
                        </div>
                    </div>

                    <div className="hero-actions">
                        <button className="secondary-btn" onClick={() => setShowEdit(true)}>
                            <Pencil size={15} /> Edit Job
                        </button>
                        <button className="primary-btn" onClick={() => setTab("applicants")}>
                            <Eye size={15} /> View Applicants
                        </button>
                    </div>
                </div>

                <div className="tabs-row">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                className={`tab-btn ${tab === t.id ? "active" : ""}`}
                                onClick={() => setTab(t.id)}
                            >
                                <Icon size={16} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                <div className="content-grid">
                    <div className="main-column">
                        {tab === "overview" && (
                            <>
                                <Panel title="Job Description">
                                    <p className="panel-text">{jobData.description}</p>
                                </Panel>

                                <Panel title="Requirements">
                                    <p className="panel-text">{jobData.requirements}</p>
                                </Panel>

                                <Panel title="Required Skills">
                                    <div className="chip-row">
                                        {jobData.skills.map((skill) => (
                                            <span key={skill} className="chip">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Panel>
                            </>
                        )}

                        {tab === "applicants" && (
                            <Panel
                                title="Applicants"
                                right={
                                    <div className="filters-inline">
                                        <div className="search-box">
                                            <Search size={16} />
                                            <input
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search applicant..."
                                            />
                                        </div>
                                        <div className="filter-box">
                                            <Filter size={16} />
                                            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                                                <option>All</option>
                                                <option>Applied</option>
                                                <option>Screening</option>
                                                <option>Shortlisted</option>
                                                <option>Interview</option>
                                                <option>Offer</option>
                                                <option>Hired</option>
                                                <option>Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="applicant-list">
                                    {filteredApplicants.map((applicant) => (
                                        <ApplicantCard key={applicant.id} applicant={applicant} />
                                    ))}
                                </div>
                            </Panel>
                        )}

                        {tab === "ai" && (
                            <Panel title="AI Hiring Insights">
                                <div className="ai-grid">
                                    <InsightCard label="Top Match" value="Aarav Sharma" desc="92% fit score based on React, JS, and UI projects." />
                                    <InsightCard label="Missing Skill Trend" value="TypeScript" desc="Most applicants miss advanced typing and state management." />
                                    <InsightCard label="Recommendation" value="Shortlist 5" desc="These candidates are highly aligned with the job description." />
                                </div>
                            </Panel>
                        )}
                    </div>

                    <div className="side-column">
                        <Panel title="Job Summary">
                            <div className="summary-list">
                                <SummaryItem label="Department" value={jobData.department} />
                                <SummaryItem label="Type" value={jobData.type} />
                                <SummaryItem label="Location" value={jobData.location} />
                                <SummaryItem label="Applicants" value={jobData.applicants} />
                                <SummaryItem label="Status" value={jobData.status} />
                            </div>
                        </Panel>

                        <Panel title="AI Matching Snapshot">
                            <div className="snapshot">
                                <div className="snapshot-ring">
                                    <span>{Math.round(filteredApplicants.reduce((a, c) => a + c.score, 0) / filteredApplicants.length || 0)}%</span>
                                </div>
                                <p className="snapshot-text">Average match score among current applicants.</p>
                            </div>
                        </Panel>
                    </div>
                </div>
            </div>
            {showEdit && (
                <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <h2 style={s.modalTitle}>Edit Job</h2>
                            <button style={s.closeBtn} onClick={() => setShowEdit(false)}>✕</button>
                        </div>

                        <div style={s.modalBody}>
                            <div style={s.formGrid}>
                                <FormField label="Job Title *" span={2}>
                                    <input
                                        style={s.input}
                                        name="title"
                                        value={editForm.title}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Department *">
                                    <input
                                        style={s.input}
                                        name="department"
                                        value={editForm.department}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Job Type">
                                    <input
                                        style={s.input}
                                        name="type"
                                        value={editForm.type}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Location" span={2}>
                                    <input
                                        style={s.input}
                                        name="location"
                                        value={editForm.location}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Job Description *" span={2}>
                                    <textarea
                                        style={{ ...s.input, minHeight: 100, resize: "vertical",lineHeight: 1.7 }}
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Requirements" span={2}>
                                    <textarea
                                        style={{ ...s.input, minHeight: 80, resize: "vertical" }}
                                        name="requirements"
                                        value={editForm.requirements}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Skills (comma-separated)" span={2}>
                                    <input
                                        style={s.input}
                                        name="skills"
                                        value={editForm.skills}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Min Salary (₹/yr)">
                                    <input
                                        style={s.input}
                                        type="number"
                                        name="minSalary"
                                        value={editForm.minSalary}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Max Salary (₹/yr)">
                                    <input
                                        style={s.input}
                                        type="number"
                                        name="maxSalary"
                                        value={editForm.maxSalary}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Application Deadline">
                                    <input
                                        style={s.input}
                                        type="date"
                                        name="deadline"
                                        value={editForm.deadline}
                                        onChange={handleEditChange}
                                    />
                                </FormField>

                                <FormField label="Status">
                                    <select
                                        style={s.input}
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditChange}
                                    >
                                        {["Active", "Draft", "Paused", "Closed"].map((st) => (
                                            <option key={st}>{st}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>
                        </div>

                        <div style={s.modalFooter}>
                            <button style={s.btnSecondary} onClick={() => setShowEdit(false)}>
                                Cancel
                            </button>
                            <button style={s.btnPrimary} onClick={handleUpdateJob}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ApplicantCard({ applicant }) {
    const meta = stageMeta[applicant.stage] || stageMeta.Applied;
    const Icon = meta.icon;

    return (
        <div className="applicant-card">
            <div className="applicant-top">
                <div>
                    <div className="applicant-name-row">
                        <h4>{applicant.name}</h4>
                        <span className="score-pill">{applicant.score}%</span>
                    </div>
                    <p className="applicant-role">{applicant.role}</p>
                </div>
                <span className="stage-pill" style={{ background: meta.bg, color: meta.color }}>
                    <Icon size={14} /> {applicant.stage}
                </span>
            </div>

            <p className="applicant-summary">{applicant.summary}</p>

            <div className="applicant-meta">
                <span>📧 {applicant.email}</span>
                <span>📍 {applicant.location}</span>
            </div>

            <div className="applicant-actions">
                <button className="ghost-btn">View</button>
                <button className="ghost-btn green">Shortlist</button>
                <button className="ghost-btn red">Reject</button>
                <button className="primary-mini-btn">Interview</button>
            </div>
        </div>
    );
}

function InsightCard({ label, value, desc }) {
    return (
        <div className="insight-card">
            <p>{label}</p>
            <h4>{value}</h4>
            <span>{desc}</span>
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="summary-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function Panel({ title, right, children }) {
    return (
        <section className="panel-card">
            <div className="panel-head">
                <h3>{title}</h3>
                {right}
            </div>
            {children}
        </section>
    );
}

function Fact({ icon: Icon, label, value }) {
    return (
        <div className="fact-card">
            <Icon size={16} />
            <div>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const colors = {
        Active: { bg: "#DCFCE7", color: "#166534" },
        Paused: { bg: "#FEF3C7", color: "#92400E" },
        Closed: { bg: "#FEE2E2", color: "#991B1B" },
        Draft: { bg: "#E5E7EB", color: "#4B5563" },
    };
    const c = colors[status] || colors.Draft;
    return <span className="status-badge" style={{ background: c.bg, color: c.color }}>{status}</span>;
}
const s = {
    label: {
      display: "block",
      fontSize: 13,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 6,
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.60)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    modal: {
      width: "min(1040px, 96vw)",
      maxHeight: "92vh",
      background: "#fff",
      borderRadius: 28,
      boxShadow: "0 30px 80px rgba(15, 23, 42, 0.28)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      border: "1px solid rgba(15, 23, 42, 0.08)",
    },
    modalHeader: {
      padding: "22px 28px",
      borderBottom: "1px solid #EEF2F7",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
    },
    modalTitle: {
      margin: 0,
      fontSize: 22,
      fontWeight: 800,
      color: "#0f172a",
      letterSpacing: "-0.03em",
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      border: "1px solid #E5E7EB",
      background: "#fff",
      fontSize: 18,
      color: "#94A3B8",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modalBody: {
      padding: 28,
      overflowY: "auto",
      background: "#fff",
    },
    modalFooter: {
      padding: "18px 28px",
      borderTop: "1px solid #EEF2F7",
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      background: "#fff",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 18,
    },
    input: {
        width: "100%",
        boxSizing: "border-box",
        border: "1.5px solid #E2E8F0",
        borderRadius: 16,
        padding: "14px 16px",
        fontSize: 14,
        fontWeight: 500,
        color: "#0f172a",
        background: "#ffffff",
        outline: "none",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        appearance: "none",
        cursor: "pointer",
      },
    btnPrimary: {
      background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
      color: "#fff",
      border: "none",
      borderRadius: 14,
      padding: "12px 18px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(79, 70, 229, 0.22)",
    },
    btnSecondary: {
      background: "#fff",
      color: "#334155",
      border: "1px solid #D1D5DB",
      borderRadius: 14,
      padding: "12px 18px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    },
  };

  function FormField({ label, children, span = 1 }) {
    return (
      <div style={{ gridColumn: `span ${span}` }}>
        <label style={s.label}>{label}</label>
        {children}
      </div>
    );
  }
const styles = `
  .job-details-page {
    min-height: 100vh;
    background: #f4f7fb;
    color: #0f172a;
    font-family: Inter, Arial, sans-serif;
  }

  .job-details-wrapper {
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: transparent;
    color: #4f46e5;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 18px;
  }

  .hero-card,
  .panel-card {
    background: #fff;
    border: 1px solid #dbe2ea;
    border-radius: 28px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .hero-card {
    padding: 22px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .title-row {
    display: flex;
    gap: 18px;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: #4f46e5;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  h1 {
    margin: 0;
    font-size: 36px;
    letter-spacing: -0.04em;
    line-height: 1.08;
  }

  .subtext {
    margin: 10px 0 0;
    color: #64748b;
    font-size: 14px;
  }

  .quick-facts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }

  .fact-card {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
  }

  .fact-card span {
    display: block;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .fact-card strong {
    display: block;
    font-size: 13px;
    color: #0f172a;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .primary-btn,
  .secondary-btn,
  .primary-mini-btn,
  .ghost-btn {
    border: none;
    border-radius: 16px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: 0.2s ease;
    font-family: inherit;
  }

  .primary-btn,
  .primary-mini-btn {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
  }

  .secondary-btn {
    background: #f8fafc;
    color: #334155;
    border: 1px solid #dbe2ea;
  }

  .tabs-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin: 18px 0;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #dbe2ea;
    background: #fff;
    color: #334155;
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .tab-btn.active {
    background: #eef2ff;
    color: #4338ca;
    border-color: #c7d2fe;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1.4fr 0.7fr;
    gap: 18px;
    align-items: start;
  }

  .main-column,
  .side-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .panel-card {
    padding: 20px;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .panel-head h3 {
    margin: 0;
    font-size: 18px;
  }

  .panel-text {
    margin: 0;
    color: #475569;
    line-height: 1.8;
    font-size: 14px;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chip {
    padding: 10px 14px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 13px;
    font-weight: 700;
  }

  .filters-inline {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .search-box,
  .filter-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #dbe2ea;
    border-radius: 16px;
    padding: 10px 14px;
  }

  .search-box input,
  .filter-box select {
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
  }

  .applicant-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .applicant-card {
    border: 1px solid #dbe2ea;
    border-radius: 22px;
    background: #fff;
    padding: 18px;
  }

  .applicant-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  .applicant-name-row {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .applicant-name-row h4 {
    margin: 0;
    font-size: 18px;
  }

  .score-pill {
    background: #ecfdf5;
    color: #047857;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 800;
  }

  .applicant-role {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 13px;
  }

  .stage-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 800;
  }

  .applicant-summary {
    margin: 12px 0 0;
    color: #475569;
    line-height: 1.7;
    font-size: 14px;
  }

  .applicant-meta {
    margin-top: 12px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    color: #64748b;
    font-size: 13px;
  }

  .applicant-actions {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
  }

  .ghost-btn {
    background: #f8fafc;
    color: #334155;
    border: 1px solid #dbe2ea;
    padding: 10px 12px;
  }

  .ghost-btn.green {
    background: #ecfdf5;
    color: #047857;
    border-color: #a7f3d0;
  }

  .ghost-btn.red {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .summary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
  }

  .summary-item span {
    color: #64748b;
    font-size: 13px;
  }

  .summary-item strong {
    color: #0f172a;
    font-size: 13px;
  }

  .snapshot {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .snapshot-ring {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 12px solid #4f46e5;
    border-right-color: #dbe2ea;
    border-bottom-color: #dbe2ea;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
  }

  .snapshot-ring span {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
  }

  .snapshot-text {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
  }

  @media (max-width: 1100px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .quick-facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    .quick-facts,
    .applicant-actions {
      grid-template-columns: 1fr;
    }

    h1 {
      font-size: 30px;
    }

    .job-details-wrapper {
      padding: 16px;
    }
  }
`;
