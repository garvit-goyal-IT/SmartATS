import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Resume Parsing",
    desc: "Extract skills, experience, and insights from resumes in seconds with NLP-powered parsing.",
  },
  {
    icon: "🎯",
    title: "Semantic Matching",
    desc: "Go beyond keywords — our AI understands context to rank candidates by true relevance.",
  },
  {
    icon: "📊",
    title: "Explainable Scores",
    desc: "Transparent AI scoring with clear reasoning for every recommendation made.",
  },
  {
    icon: "🚀",
    title: "Automated Pipeline",
    desc: "From application to offer — automate screening, scheduling, and notifications.",
  },
  {
    icon: "🔍",
    title: "Smart Shortlisting",
    desc: "AI suggests your top candidates before you even open the first resume.",
  },
  {
    icon: "📅",
    title: "Interview Scheduler",
    desc: "One-click interview scheduling with calendar sync and automated reminders.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Head of Talent, Razorpay",
    text: "TalentFlow cut our time-to-hire from 45 days to 4. The AI scoring is eerily accurate.",
    avatar: "PS",
  },
  {
    name: "Marcus Chen",
    role: "VP Engineering, Groww",
    text: "We evaluated 1200 applications in a week. Zero bias, full transparency. Game changer.",
    avatar: "MC",
  },
  {
    name: "Ananya Iyer",
    role: "HR Director, PhonePe",
    text: "The explainable AI is what sold us. We can justify every hire decision to leadership.",
    avatar: "AI",
  },
];

export default function PremiumHome() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, e.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const visible = (id) => visibleSections.has(id);

  return (
    <div style={styles.root}>
      {/* ── NAV ── */}
      <nav style={{ ...styles.nav, background: scrollY > 60 ? "rgba(6,10,20,0.95)" : "transparent", backdropFilter: scrollY > 60 ? "blur(16px)" : "none" }}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>⚡</span>
            <span style={styles.logoText}>TalentFlow AI</span>
          </div>
          <div style={styles.navLinks}>
            {["Features", "How It Works", "Pricing"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={styles.navLink}>{l}</a>
            ))}
          </div>
          <div style={styles.navCta}>
            <button onClick={() => navigate("/login")} style={styles.btnOutline}>Sign In</button>
            <button onClick={() => navigate("/register")} style={styles.btnGold}>Start Hiring Today →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={styles.hero}>
        <div style={styles.heroGlow1} />
        <div style={styles.heroGlow2} />
        <div style={{ ...styles.heroGrid, opacity: 0.07 }} />
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgeDot} />
          <span>Limited Early Access Available</span>
        </div>
        <h1 style={styles.heroTitle}>
          AI-Powered Hiring.
          <br />
          <span style={styles.heroAccent}>Smarter Decisions.</span>
          <br />
          Better Teams.
        </h1>
        <p style={styles.heroSub}>
          Transform Your Recruitment Process with intelligent automation, semantic matching,
          and explainable AI that helps you find the best talent faster — every time.
        </p>
        <div style={styles.heroBtns}>
          <button onClick={() => navigate("/register")} style={styles.btnHero}>
            Start Hiring Today
            <span style={{ marginLeft: 8 }}>→</span>
          </button>
          <button onClick={() => navigate("/login")} style={styles.btnHeroOutline}>
            View Live Demo
          </button>
        </div>

      </section>

      {/* ── MARQUEE ── */}
      <div style={styles.marqueeWrap}>
        <div style={styles.marqueeInner}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={styles.marqueeText}>
              Hire Smarter with AI &nbsp;·&nbsp; Find the Best Talent Faster &nbsp;·&nbsp;
              Transform Your Recruitment Process &nbsp;·&nbsp; AI-Powered Hiring &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={styles.section} data-section="features">
        <div style={styles.sectionLabel}>Features</div>
        <h2 style={{ ...styles.sectionTitle, ...animIn(visible("features")) }}>
          Everything you need to hire smarter
        </h2>
        <p style={{ ...styles.sectionSub, ...animIn(visible("features"), 100) }}>
          One platform. Every tool your team needs to source, screen, and hire top talent at scale.
        </p>
        <div style={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{ ...styles.featureCard, ...animIn(visible("features"), i * 80 + 150) }}
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ ...styles.section, ...styles.sectionDark }} data-section="how">
        <div style={styles.sectionLabel}>How It Works</div>
        <h2 style={{ ...styles.sectionTitle, ...animIn(visible("how")) }}>
          From job post to hired — in days
        </h2>
        <div style={styles.stepsWrap}>
          {[
            { n: "01", title: "Post a Job", desc: "Create a detailed job description. Our AI instantly generates skill requirements and screening criteria." },
            { n: "02", title: "Receive & Parse", desc: "Candidates apply. AI parses every resume instantly — extracting skills, experience, and fit scores." },
            { n: "03", title: "AI Ranks & Scores", desc: "Semantic matching ranks candidates by true relevance. Explainable scores show you exactly why." },
            { n: "04", title: "Schedule & Hire", desc: "One-click interview scheduling, automated reminders, and a clear pipeline to your next great hire." },
          ].map((step, i) => (
            <div key={step.n} style={{ ...styles.stepCard, ...animIn(visible("how"), i * 100) }}>
              <div style={styles.stepNum}>{step.n}</div>
              <div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={styles.section} data-section="testimonials">
        <div style={styles.sectionLabel}>Testimonials</div>
        <h2 style={{ ...styles.sectionTitle, ...animIn(visible("testimonials")) }}>
          Trusted by modern HR teams
        </h2>
        <div style={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              style={{ ...styles.testimonialCard, ...animIn(visible("testimonials"), i * 100) }}
            >
              <p style={styles.testimonialText}>"{t.text}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>{t.avatar}</div>
                <div>
                  <div style={styles.testimonialName}>{t.name}</div>
                  <div style={styles.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ── PRICING ── */}
      <section id="pricing" style={{ ...styles.section, ...styles.sectionDark }} data-section="pricing">
        <div style={styles.sectionLabel}>Pricing</div>
        <h2 style={{ ...styles.sectionTitle, ...animIn(visible("pricing")) }}>
          Simple, transparent pricing
        </h2>
        <p style={{ ...styles.sectionSub, ...animIn(visible("pricing"), 100) }}>
          Start with our free tier. Upgrade to unlock unlimited AI-powered hiring and exclusive features.
        </p>
        {/* Pricing cards could go here */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ ...styles.featureCard,height: 500, width: 300 }}>
            <h1 style={{...styles.featureTitle, fontSize: 40}}>Basic</h1>
            <p style={styles.featureDesc}>
              100 applications/month. <br/>
              No AI resume Parsing<br/>
              No AI candidate Scoring<br/>
              No Auto Match Candidate<br/>
              Standard support <br/>
               </p>
            <button onClick={() => navigate("/register")} style={{ ...styles.btnHeroOutline, marginTop: 40 }}>
              Get Started for Free
            </button>
            <h1 style={{...styles.featureTitle, fontSize: 40, marginTop: 40}}>Free </h1>
          </div>
          <div style={{ ...styles.featureCard,height: 500, width: 300 }}>
            <h1 style={{...styles.featureTitle,fontSize: 40}}>Pro</h1>
            <p style={styles.featureDesc}>
              250 applications/month<br/>
              AI Candidate Scoring<br/>
              AI Resume Parsing<br/>
              No Auto Match Candidate<br/>
              Standard Support<br/>
              </p>
            <button onClick={() => navigate("/register")} style={{ ...styles.btnHero, marginTop: 40 }}>
              Upgrade to Pro
            </button>
            <h1 style={{...styles.featureTitle, fontSize: 40, marginTop: 40}}>Rs 799 </h1>
            <h1 style={{...styles.featureTitle, fontSize: 20, marginTop: 5}}>Per Month </h1>
          </div>
          <div style={{ ...styles.featureCard,height: 500, width: 300 }}>
            <h1 style={{...styles.featureTitle, fontSize: 40}}>Ultra</h1>
            <p style={styles.featureDesc}>
              Unlimited applications. <br/>
              Full AI features <br/>
              Ai candidate Matching <br/>
              Priority support <br/>
              24/7 Avaialble <br/>
              </p>
            <button onClick={() => navigate("/register")} style={{ ...styles.btnHero, marginTop: 40 }}>
              Upgrade to Pro
            </button>
            <h1 style={{...styles.featureTitle, fontSize: 40, marginTop:40}}>Rs 1299 </h1>
            <h1 style={{...styles.featureTitle, fontSize: 20, marginTop: 5}}>Per Month </h1>
          </div>
        </div>

      </section>

      {/* ── CTA ── */}
      <section style={styles.ctaSection} data-section="cta">
        <div style={styles.ctaGlow} />
        <div style={styles.sectionLabel}>Get Started</div>
        <h2 style={styles.ctaTitle}>Ready to hire smarter?</h2>
        <p style={styles.ctaSub}>
          Join 500+ companies already using TalentFlow AI.
          <br />
          <strong style={{ color: "#F5C842" }}>Limited Early Access Available</strong> — set up your account in minutes.
        </p>
        <button onClick={() => navigate("/register")} style={styles.btnHero}>
          Start Hiring Today →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>⚡</span>
            <span style={styles.logoText}>TalentFlow AI</span>
          </div>
          <p style={styles.footerSub}>AI-Powered Hiring. Smarter Decisions. Better Teams.</p>
          <p style={styles.footerCopy}>© 2026 TalentFlow AI .All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>
    </div>
  );
}

function animIn(visible, delay = 0) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  };
}

const styles = {
  root: { fontFamily: "'Inter', sans-serif", background: "#060A14", color: "#E8EAF0", minHeight: "100vh", overflowX: "hidden" },

  // Nav
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "background 0.3s, backdrop-filter 0.3s" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: 32 },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoMark: { fontSize: 22 },
  logoText: { fontFamily: "'Clash Display', sans-serif", fontSize: 18, fontWeight: 600, color: "#fff", letterSpacing: "-0.3px" },
  navLinks: { display: "flex", gap: 32, marginLeft: "auto" },
  navLink: { color: "#9AA0B2", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" },
  navCta: { display: "flex", gap: 12, alignItems: "center" },
  btnOutline: { background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#E8EAF0", padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "border-color 0.2s" },
  btnGold: { background: "linear-gradient(135deg, #F5C842 0%, #E8A000 100%)", border: "none", color: "#0A0A00", padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" },

  // Hero
  hero: { position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8rem 2rem 4rem", textAlign: "center", overflow: "hidden" },
  heroGlow1: { position: "absolute", top: "10%", left: "20%", width: 600, height: 600, background: "radial-gradient(circle, rgba(99,74,255,0.18) 0%, transparent 70%)", pointerEvents: "none" },
  heroGlow2: { position: "absolute", top: "30%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)", pointerEvents: "none" },
  heroGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" },
  heroBadge: { display: "flex", alignItems: "center", gap: 8, background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.3)", borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 500, color: "#F5C842", marginBottom: 32 },
  heroBadgeDot: { width: 8, height: 8, borderRadius: "50%", background: "#F5C842", animation: "pulse 2s infinite" },
  heroTitle: { fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2.6rem, 6vw, 5rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: "#fff", maxWidth: 800, marginBottom: 24 },
  heroAccent: { background: "linear-gradient(135deg, #F5C842, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#9AA0B2", maxWidth: 600, lineHeight: 1.7, marginBottom: 40 },
  heroBtns: { display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 },
  btnHero: { background: "linear-gradient(135deg, #F5C842 0%, #E8A000 100%)", border: "none", color: "#0A0800", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" },
  btnHeroOutline: { background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "#E8EAF0", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 500, cursor: "pointer" },
  heroStats: { display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center" },
  heroStatVal: { fontFamily: "'Clash Display', sans-serif", fontSize: "2.2rem", fontWeight: 700, color: "#fff", lineHeight: 1 },
  heroStatLabel: { fontSize: 13, color: "#9AA0B2", marginTop: 4 },

  // Marquee
  marqueeWrap: { borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 0", overflow: "hidden", background: "rgba(255,255,255,0.02)" },
  marqueeInner: { display: "flex", animation: "marquee 18s linear infinite", whiteSpace: "nowrap" },
  marqueeText: { fontSize: 13, color: "#6B7280", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", padding: "0 2rem" },

  // Sections
  section: { maxWidth: 1200, margin: "0 auto", padding: "6rem 2rem", textAlign: "center" },
  sectionDark: { maxWidth: "100%", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  sectionLabel: { display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5C842", marginBottom: 16, background: "rgba(245,200,66,0.08)", padding: "4px 12px", borderRadius: 100 },
  sectionTitle: { fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.8px", marginBottom: 16, maxWidth: 640, marginLeft: "auto", marginRight: "auto" },
  sectionSub: { fontSize: 17, color: "#9AA0B2", maxWidth: 520, margin: "0 auto 4rem", lineHeight: 1.7 },

  // Features
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, textAlign: "left" },
  featureCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 28px", transition: "border-color 0.3s, background 0.3s" },
  featureIcon: { fontSize: 32, marginBottom: 16 },
  featureTitle: { fontFamily: "'Clash Display', sans-serif", fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 },
  featureDesc: { fontSize: 14, color: "#9AA0B2", lineHeight: 1.65 },

  // Steps
  stepsWrap: { maxWidth: 900, margin: "3rem auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 0 },
  stepCard: { padding: "2rem 1.5rem", borderLeft: "1px solid rgba(255,255,255,0.08)", textAlign: "left" },
  stepNum: { fontFamily: "'Clash Display', sans-serif", fontSize: 48, fontWeight: 700, color: "rgba(245,200,66,0.2)", lineHeight: 1, marginBottom: 12 },
  stepTitle: { fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 8 },
  stepDesc: { fontSize: 14, color: "#9AA0B2", lineHeight: 1.65 },

  // Testimonials
  testimonialsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: "3rem", textAlign: "left" },
  testimonialCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 },
  testimonialText: { fontSize: 15, color: "#C8CDD8", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: 12 },
  testimonialAvatar: { width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#634AFF,#F5C842)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 },
  testimonialName: { fontSize: 14, fontWeight: 600, color: "#fff" },
  testimonialRole: { fontSize: 13, color: "#9AA0B2" },

  // CTA
  ctaSection: { position: "relative", textAlign: "center", padding: "6rem 2rem", overflow: "hidden" },
  ctaGlow: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(99,74,255,0.2) 0%, transparent 70%)", pointerEvents: "none" },
  ctaTitle: { fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-1px" },
  ctaSub: { fontSize: 17, color: "#9AA0B2", marginBottom: 40, lineHeight: 1.7 },

  // Footer
  footer: { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem" },
  footerInner: { maxWidth: 1200, margin: "0 auto", textAlign: "center" },
  footerSub: { fontSize: 13, color: "#6B7280", margin: "8px 0 4px" },
  footerCopy: { fontSize: 12, color: "#4B5263" },
};