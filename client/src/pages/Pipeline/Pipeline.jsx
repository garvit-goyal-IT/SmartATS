
import React, { useMemo, useState, useRef } from "react";
import {
  Search, Filter, Users, CircleDot, ClipboardCheck,
  CalendarClock, Award, Briefcase, CheckCircle2, XCircle,
  MoveRight, Plus, X, Mail, Phone, Star, Brain,
  ChevronRight, Clock, Zap
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const initialCandidates = [
  { id: 1, name: "Aarav Sharma", role: "Frontend Developer Intern", stage: "Applied", score: 92, aiInsight: "Strong React & TypeScript. Top 5% match.", recruiter: "Priya Mehta", date: "2026-05-27", email: "aarav@gmail.com", skills: ["React", "TypeScript", "CSS"], notes: "Resume parsed. Strong React and JavaScript skills." },
  { id: 2, name: "Neha Verma", role: "Full Stack Developer", stage: "Screening", score: 86, aiInsight: "MERN stack solid. Salary alignment needed.", recruiter: "Rahul Singh", date: "2026-05-27", email: "neha@gmail.com", skills: ["Node.js", "MongoDB", "React"], notes: "Good MERN project experience. Needs salary discussion." },
  { id: 3, name: "Kabir Malhotra", role: "Backend Developer", stage: "Shortlisted", score: 79, aiInsight: "Good API design. Missing system design exposure.", recruiter: "Ananya Gupta", date: "2026-05-26", email: "kabir@gmail.com", skills: ["Node.js", "PostgreSQL", "REST APIs"], notes: "Strong Node.js basics and API design understanding." },
  { id: 4, name: "Simran Kaur", role: "UI/UX Designer", stage: "Interview", score: 88, aiInsight: "Portfolio is exceptional. Cultural fit: high.", recruiter: "Priya Mehta", date: "2026-05-25", email: "simran@gmail.com", skills: ["Figma", "UX Research", "Prototyping"], notes: "Interview scheduled for portfolio discussion." },
  { id: 5, name: "Rohit Jain", role: "Product Intern", stage: "Offer", score: 91, aiInsight: "Rare blend of product + tech. Strong hire.", recruiter: "Rahul Singh", date: "2026-05-24", email: "rohit@gmail.com", skills: ["Product", "Analytics", "Agile"], notes: "Final round completed, offer pending approval." },
  { id: 6, name: "Meera Shah", role: "Backend Developer", stage: "Hired", score: 95, aiInsight: "Exceptional candidate. Top 1% for this role.", recruiter: "Ananya Gupta", date: "2026-05-23", email: "meera@gmail.com", skills: ["Node.js", "AWS", "Microservices"], notes: "Accepted offer and joined onboarding queue." },
  { id: 7, name: "Arjun Nair", role: "DevOps Engineer", stage: "Applied", score: 74, aiInsight: "CI/CD experience good. Cloud skills need depth.", recruiter: "Priya Mehta", date: "2026-05-27", email: "arjun@gmail.com", skills: ["Docker", "Jenkins", "Linux"], notes: "Applied via LinkedIn. Initial screening pending." },
  { id: 8, name: "Pooja Rao", role: "Data Analyst", stage: "Rejected", score: 51, aiInsight: "Skills gap too large for this role level.", recruiter: "Rahul Singh", date: "2026-05-22", email: "pooja@gmail.com", skills: ["Excel", "SQL"], notes: "Insufficient experience for senior level requirements." },
];

const STAGES = [
  { name: "Applied",     icon: CircleDot,     color: "#3B82F6", light: "#EFF6FF", dark: "#1D4ED8" },
  { name: "Screening",   icon: ClipboardCheck, color: "#F59E0B", light: "#FFFBEB", dark: "#B45309" },
  { name: "Shortlisted", icon: Users,          color: "#8B5CF6", light: "#F5F3FF", dark: "#6D28D9" },
  { name: "Interview",   icon: CalendarClock,  color: "#10B981", light: "#ECFDF5", dark: "#047857" },
  { name: "Offer",       icon: Award,          color: "#F97316", light: "#FFF7ED", dark: "#C2410C" },
  { name: "Hired",       icon: CheckCircle2,   color: "#22C55E", light: "#F0FDF4", dark: "#15803D" },
  { name: "Rejected",    icon: XCircle,        color: "#EF4444", light: "#FEF2F2", dark: "#B91C1C" },
];

const EMPTY_FORM = { name: "", role: "", stage: "Applied", score: "", email: "", skills: "", notes: "" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(name) { return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); }
function scoreColor(s) { if (s >= 85) return "#22C55E"; if (s >= 70) return "#F59E0B"; return "#EF4444"; }
function scoreLabel(s) { if (s >= 90) return "Excellent"; if (s >= 80) return "Strong"; if (s >= 70) return "Good"; return "Weak"; }

const AVATAR_COLORS = [
  ["#EDE9FE","#7C3AED"], ["#DBEAFE","#1D4ED8"], ["#D1FAE5","#065F46"],
  ["#FEF3C7","#92400E"], ["#FCE7F3","#9D174D"], ["#E0F2FE","#0369A1"],
];
function avatarColor(name) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

// ─── SCORE RING ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, fontWeight:700, color }}>
        {score}
      </div>
    </div>
  );
}

// ─── CANDIDATE CARD ───────────────────────────────────────────────────────────

function CandidateCard({ candidate, nextStage, onMove, onView, isDragging, onDragStart, onDragEnd }) {
  const [bg, fg] = avatarColor(candidate.name);
  return (
    <div
      className="ccard"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ opacity: isDragging ? 0.4 : 1, cursor: "grab" }}
    >
      {/* Top row */}
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:bg, color:fg,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:700, flexShrink:0 }}>
          {initials(candidate.name)}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{candidate.name}</div>
          <div style={{ fontSize:12, color:"#94A3B8", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{candidate.role}</div>
        </div>
        <ScoreRing score={candidate.score} size={46} />
      </div>

      {/* AI Insight */}
      <div style={{ background:"#F8FAFF", border:"1px solid #E0E7FF", borderRadius:10, padding:"8px 10px",
        display:"flex", gap:7, alignItems:"flex-start", marginBottom:10 }}>
        <Zap size={12} style={{ color:"#6366F1", flexShrink:0, marginTop:1 }} />
        <span style={{ fontSize:12, color:"#4338CA", lineHeight:1.5 }}>{candidate.aiInsight}</span>
      </div>

      {/* Skills */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
        {candidate.skills.slice(0,3).map(sk => (
          <span key={sk} style={{ background:"#F1F5F9", color:"#475569", padding:"2px 8px", borderRadius:100, fontSize:11, fontWeight:500 }}>{sk}</span>
        ))}
      </div>

      {/* Meta */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        paddingTop:8, borderTop:"1px solid #F1F5F9", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <Clock size={11} style={{ color:"#94A3B8" }} />
          <span style={{ fontSize:11, color:"#94A3B8" }}>{candidate.date}</span>
        </div>
        <span style={{ fontSize:11, fontWeight:600, color: scoreColor(candidate.score) }}>
          {scoreLabel(candidate.score)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:8 }}>
        <button className="ccard-ghost" onClick={() => onView(candidate)}>View</button>
        {nextStage && (
          <button className="ccard-primary" onClick={() => onMove(candidate.id, nextStage)}>
            {nextStage} <MoveRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ADD CANDIDATE MODAL ──────────────────────────────────────────────────────

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span style={{ fontWeight:700, fontSize:17, color:"#0F172A" }}>Add Candidate</span>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Full Name *" span={2}><input className="finput" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. Riya Desai" /></Field>
            <Field label="Applying For *"><input className="finput" value={form.role} onChange={e=>f("role",e.target.value)} placeholder="e.g. Frontend Engineer" /></Field>
            <Field label="Stage">
              <select className="finput" value={form.stage} onChange={e=>f("stage",e.target.value)}>
                {STAGES.map(s=><option key={s.name}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Email" span={2}><input className="finput" type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="candidate@email.com" /></Field>
            <Field label="AI Score (0-100)"><input className="finput" type="number" min={0} max={100} value={form.score} onChange={e=>f("score",e.target.value)} placeholder="85" /></Field>
            <Field label="Skills (comma-separated)"><input className="finput" value={form.skills} onChange={e=>f("skills",e.target.value)} placeholder="React, Node.js" /></Field>
            <Field label="Notes" span={2}><textarea className="finput" rows={3} style={{ resize:"vertical" }} value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Recruiter observations..." /></Field>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn-pri" onClick={()=>{
            if(!form.name||!form.role) return alert("Name and role are required.");
            onAdd({ ...form, id: Date.now(), score: Number(form.score)||70, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean), recruiter:"You", aiInsight:"Manually added candidate. Awaiting AI parse." });
            onClose();
          }}>Add to Pipeline</button>
        </div>
      </div>
    </div>
  );
}

// ─── VIEW MODAL ───────────────────────────────────────────────────────────────

function ViewModal({ candidate, onClose, onMove, stages }) {
  const idx = stages.findIndex(s=>s.name===candidate.stage);
  const next = stages[idx+1]?.name;
  const [bg, fg] = avatarColor(candidate.name);
  const stage = stages.find(s=>s.name===candidate.stage);
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:520 }}>
        <div className="modal-head">
          <span style={{ fontWeight:700, fontSize:17, color:"#0F172A" }}>Candidate Profile</span>
          <button className="close-btn" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="modal-body">
          {/* Header */}
          <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20, padding:16, background:"#F8FAFC", borderRadius:14 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:bg, color:fg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700 }}>{initials(candidate.name)}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:17, color:"#0F172A" }}>{candidate.name}</div>
              <div style={{ fontSize:14, color:"#64748B", marginTop:2 }}>{candidate.role}</div>
              <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                <span style={{ background:stage?.light, color:stage?.dark, padding:"3px 10px", borderRadius:100, fontSize:12, fontWeight:600 }}>{candidate.stage}</span>
                <span style={{ background: scoreColor(candidate.score)+"20", color: scoreColor(candidate.score), padding:"3px 10px", borderRadius:100, fontSize:12, fontWeight:600 }}>{candidate.score}% match</span>
              </div>
            </div>
            <ScoreRing score={candidate.score} size={60} />
          </div>

          {/* AI Insight */}
          <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", border:"1px solid #C7D2FE", borderRadius:12, padding:14, marginBottom:16 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
              <Brain size={14} style={{ color:"#6366F1" }} />
              <span style={{ fontSize:12, fontWeight:700, color:"#4338CA", textTransform:"uppercase", letterSpacing:"0.06em" }}>AI Analysis</span>
            </div>
            <p style={{ fontSize:14, color:"#4338CA", margin:0, lineHeight:1.6 }}>{candidate.aiInsight}</p>
          </div>

          {/* Details */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[
              { icon:<Mail size={13}/>, label:"Email", value: candidate.email },
              { icon:<Users size={13}/>, label:"Recruiter", value: candidate.recruiter },
              { icon:<Clock size={13}/>, label:"Applied", value: candidate.date },
              { icon:<Star size={13}/>, label:"Score Label", value: scoreLabel(candidate.score) },
            ].map(item=>(
              <div key={item.label} style={{ background:"#F8FAFC", borderRadius:10, padding:"10px 12px", border:"1px solid #F1F5F9" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4, color:"#94A3B8" }}>{item.icon}<span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>{item.label}</span></div>
                <div style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{item.value||"—"}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          {candidate.skills?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#475569", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Skills</div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {candidate.skills.map(sk=><span key={sk} style={{ background:"#EEF2FF", color:"#4338CA", padding:"4px 12px", borderRadius:100, fontSize:13, fontWeight:500 }}>{sk}</span>)}
              </div>
            </div>
          )}

          {/* Notes */}
          {candidate.notes && (
            <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#92400E", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Recruiter Notes</div>
              <p style={{ fontSize:13, color:"#78350F", margin:0, lineHeight:1.65 }}>{candidate.notes}</p>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn-sec" onClick={onClose}>Close</button>
          {next && <button className="btn-pri" onClick={()=>{ onMove(candidate.id,next); onClose(); }}>Move to {next} <MoveRight size={14}/></button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, span=1 }) {
  return <div style={{ gridColumn:`span ${span}` }}><label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{label}</label>{children}</div>;
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Pipeline() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [viewCandidate, setViewCandidate] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const filtered = useMemo(() => candidates.filter(c => {
    const q = search.toLowerCase();
    const matchQ = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.recruiter.toLowerCase().includes(q);
    const matchS = stageFilter === "All" || c.stage === stageFilter;
    return matchQ && matchS;
  }), [candidates, search, stageFilter]);

  const grouped = STAGES.reduce((acc, s) => { acc[s.name] = filtered.filter(c => c.stage === s.name); return acc; }, {});

  const move = (id, stage) => setCandidates(p => p.map(c => c.id === id ? { ...c, stage } : c));
  const add = (c) => setCandidates(p => [c, ...p]);

  const onDragStart = (id) => setDragId(id);
  const onDragEnd = () => { setDragId(null); setDragOver(null); };
  const onDrop = (stageName) => { if (dragId) move(dragId, stageName); setDragId(null); setDragOver(null); };

  const stats = [
    { label: "Total", value: candidates.length, icon:"👥", color:"#6366F1" },
    { label: "Active", value: candidates.filter(c=>!["Hired","Rejected"].includes(c.stage)).length, icon:"⚡", color:"#F59E0B" },
    { label: "Hired", value: candidates.filter(c=>c.stage==="Hired").length, icon:"✅", color:"#22C55E" },
    { label: "Avg Score", value: Math.round(candidates.reduce((a,c)=>a+c.score,0)/candidates.length)+"%", icon:"🧠", color:"#8B5CF6" },
  ];

  return (
    <div className="pp-root">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="pp-header">
        <div>
          <div className="pp-eyebrow"><Briefcase size={13}/> Smart ATS Hiring Suite</div>
          <h1 className="pp-title">Candidate Pipeline</h1>
          <p className="pp-sub">Drag & drop candidates across stages · AI-ranked · Real-time updates</p>
        </div>
        <button className="btn-pri" style={{ display:"flex", alignItems:"center", gap:8 }} onClick={()=>setShowAdd(true)}>
          <Plus size={15}/> Add Candidate
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="pp-stats">
        {stats.map(s=>(
          <div key={s.label} className="pp-stat">
            <div style={{ fontSize:24, lineHeight:1 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:26, fontWeight:800, color:"#0F172A", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#94A3B8", fontWeight:500, marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="pp-toolbar">
        <div className="pp-search">
          <Search size={15} style={{ color:"#94A3B8", flexShrink:0 }}/>
          <input placeholder="Search name, role, recruiter…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="pp-filter">
          <Filter size={15} style={{ color:"#94A3B8" }}/>
          <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)}>
            <option>All</option>
            {STAGES.map(s=><option key={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ marginLeft:"auto", fontSize:13, color:"#94A3B8", display:"flex", alignItems:"center", gap:5 }}>
          <span>💡</span> Drag cards to move stages
        </div>
      </div>

      {/* ── Kanban ── */}
      <div className="pp-board">
        {STAGES.map((stage, idx) => {
          const items = grouped[stage.name] || [];
          const nextStage = STAGES[idx+1]?.name;
          const isOver = dragOver === stage.name;
          return (
            <div
              key={stage.name}
              className="pp-col"
              style={{ outline: isOver ? `2px dashed ${stage.color}` : "none", background: isOver ? stage.light : undefined }}
              onDragOver={e=>{ e.preventDefault(); setDragOver(stage.name); }}
              onDragLeave={()=>setDragOver(null)}
              onDrop={()=>onDrop(stage.name)}
            >
              {/* Column header */}
              <div className="pp-col-head" style={{ borderBottom:`2px solid ${stage.color}20` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:stage.light, color:stage.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <stage.icon size={14}/>
                  </div>
                  <span style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{stage.name}</span>
                </div>
                <span style={{ minWidth:24, height:24, borderRadius:100, background:stage.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="pp-col-body">
                {items.length === 0
                  ? <div className="pp-empty">Drop here</div>
                  : items.map(c=>(
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      nextStage={nextStage}
                      onMove={move}
                      onView={setViewCandidate}
                      isDragging={dragId===c.id}
                      onDragStart={()=>onDragStart(c.id)}
                      onDragEnd={onDragEnd}
                    />
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={add}/>}
      {viewCandidate && <ViewModal candidate={viewCandidate} onClose={()=>setViewCandidate(null)} onMove={move} stages={STAGES}/>}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const CSS = `
  * { box-sizing: border-box; }
  .pp-root { padding: 28px; background: #F4F7FB; min-height: 100vh; font-family: 'Inter', 'DM Sans', sans-serif; }
  
  .pp-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .pp-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #6366F1; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
  .pp-title { font-size: 32px; font-weight: 800; color: #0F172A; letter-spacing: -0.8px; margin: 0 0 4px; }
  .pp-sub { font-size: 14px; color: #94A3B8; margin: 0; }
  
  .pp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .pp-stat { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
  
  .pp-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .pp-search { flex: 1; min-width: 240px; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 11px 14px; display: flex; align-items: center; gap: 10px; }
  .pp-search input { border: none; outline: none; font-size: 14px; width: 100%; background: transparent; color: #0F172A; }
  .pp-filter { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 11px 14px; display: flex; align-items: center; gap: 10px; }
  .pp-filter select { border: none; outline: none; font-size: 14px; background: transparent; color: #374151; cursor: pointer; }
  
  .pp-board { display: grid; grid-template-columns: repeat(7, minmax(260px, 1fr)); gap: 14px; overflow-x: auto; padding-bottom: 12px; }
  
  .pp-col { background: #fff; border: 1px solid #E2E8F0; border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 0; min-height: 400px; transition: outline 0.15s, background 0.15s; }
  .pp-col-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 12px; }
  .pp-col-body { display: flex; flex-direction: column; gap: 10px; flex: 1; }
  
  .pp-empty { border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; color: #CBD5E1; font-size: 13px; font-weight: 500; }
  
  .ccard { background: #FAFBFF; border: 1px solid #E8EDF5; border-radius: 14px; padding: 14px; transition: box-shadow 0.2s, transform 0.15s; }
  .ccard:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .ccard-ghost { flex: 1; background: #EEF2FF; color: #4338CA; border: none; border-radius: 9px; padding: 8px 10px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
  .ccard-primary { flex: 1.3; background: #4F46E5; color: #fff; border: none; border-radius: 9px; padding: 8px 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; font-family: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
  .ccard-ghost:hover { background: #E0E7FF; }
  .ccard-primary:hover { background: #4338CA; }
  
  .btn-pri { background: linear-gradient(135deg,#4F46E5,#7C3AED); color: #fff; border: none; border-radius: 11px; padding: 11px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
  .btn-sec { background: #F8FAFC; color: #374151; border: 1px solid #E2E8F0; border-radius: 11px; padding: 11px 20px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  
  .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
  .modal { background: #fff; border-radius: 18px; width: 100%; max-width: 660px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.2); }
  .modal-head { padding: 18px 22px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; }
  .modal-body { padding: 20px 22px; overflow-y: auto; flex: 1; }
  .modal-foot { padding: 14px 22px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end; gap: 10px; }
  .close-btn { background: #F1F5F9; border: none; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748B; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .finput { width: 100%; padding: 9px 12px; border: 1px solid #E2E8F0; border-radius: 9px; font-size: 14px; outline: none; background: #FAFAFA; color: #0F172A; font-family: inherit; }
  .finput:focus { border-color: #6366F1; background: #fff; }

  @media (max-width: 900px) {
    .pp-stats { grid-template-columns: repeat(2,1fr); }
    .pp-title { font-size: 24px; }
    .pp-board { grid-template-columns: repeat(7, 270px); }
  }
`