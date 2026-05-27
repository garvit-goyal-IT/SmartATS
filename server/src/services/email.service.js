import nodemailer from "nodemailer"

const getTransporter = () => nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendMail = async ({ to, subject, html }) => {
    try {
        const transporter = getTransporter()
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to, subject, html
        })
        console.log(`Email sent to ${to}`)
    } catch(error) {
        console.error("Email error:", error.message)
    }
}

// ─── Templates ────────────────────────────────────────────

const baseTemplate = (content) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #0f172a; padding: 32px; text-align: center;">
        <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; background: #6366f1; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">T</div>
            <span style="color: white; font-size: 20px; font-weight: 700;">TalentFlow AI</span>
        </div>
        <p style="color: #818cf8; font-size: 13px; margin: 8px 0 0;">Smart ATS Hiring Suite</p>
    </div>
    <div style="padding: 40px 32px;">
        ${content}
    </div>
    <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 TalentFlow AI — Smart ATS Hiring Suite</p>
    </div>
</div>
`

// 1 — Application received
export const sendApplicationReceived = async ({ candidateName, candidateEmail, jobTitle, companyName }) => {
    await sendMail({
        to: candidateEmail,
        subject: `Application Received — ${jobTitle} at ${companyName}`,
        html: baseTemplate(`
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                Application Received ✅
            </h2>
            <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">
                Hi ${candidateName}, your application has been received successfully.
            </p>
            <div style="background: #eef2ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #374151; font-size: 14px; margin: 0;">
                    <strong>Position:</strong> ${jobTitle}<br/>
                    <strong>Company:</strong> ${companyName}<br/>
                    <strong>Status:</strong> Under Review
                </p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7;">
                Our team will review your profile and get back to you soon. 
                We use AI-powered screening to ensure every candidate gets a fair evaluation.
            </p>
        `)
    })
}

// 2 — Application status changed
export const sendStatusUpdate = async ({ candidateName, candidateEmail, jobTitle, newStatus }) => {
    const statusMessages = {
        shortlisted:          { emoji: "🎯", text: "You've been shortlisted!", color: "#0ea5e9" },
        interview_scheduled:  { emoji: "📅", text: "Interview Scheduled",      color: "#8b5cf6" },
        offer_sent:           { emoji: "🎉", text: "Offer Extended!",          color: "#22c55e" },
        hired:                { emoji: "🚀", text: "Congratulations!",         color: "#22c55e" },
        rejected:             { emoji: "📝", text: "Application Update",       color: "#64748b" },
    }

    const msg = statusMessages[newStatus] || { emoji: "📋", text: "Application Update", color: "#6366f1" }

    await sendMail({
        to: candidateEmail,
        subject: `${msg.emoji} ${msg.text} — ${jobTitle}`,
        html: baseTemplate(`
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                ${msg.emoji} ${msg.text}
            </h2>
            <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">
                Hi ${candidateName}, here's an update on your application.
            </p>
            <div style="background: #f8fafc; border-left: 4px solid ${msg.color}; border-radius: 0 12px 12px 0; padding: 20px; margin-bottom: 24px;">
                <p style="color: #374151; font-size: 14px; margin: 0;">
                    <strong>Position:</strong> ${jobTitle}<br/>
                    <strong>New Status:</strong> <span style="color: ${msg.color}; font-weight: 700;">${newStatus.replace(/_/g, " ").toUpperCase()}</span>
                </p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7;">
                Thank you for your interest in this position. 
                We appreciate your time and effort throughout this process.
            </p>
        `)
    })
}

// 3 — Interview scheduled
export const sendInterviewScheduled = async ({ candidateName, candidateEmail, jobTitle, date, time, mode, meetingLink }) => {
    await sendMail({
        to: candidateEmail,
        subject: `📅 Interview Scheduled — ${jobTitle}`,
        html: baseTemplate(`
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                Interview Scheduled 📅
            </h2>
            <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">
                Hi ${candidateName}, your interview has been scheduled.
            </p>
            <div style="background: #f5f3ff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #374151; font-size: 15px; margin: 0; line-height: 2;">
                    <strong>Position:</strong> ${jobTitle}<br/>
                    <strong>Date:</strong> ${new Date(date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}<br/>
                    <strong>Time:</strong> ${time}<br/>
                    <strong>Mode:</strong> ${mode}<br/>
                    ${meetingLink ? `<strong>Link:</strong> <a href="${meetingLink}" style="color: #6366f1;">${meetingLink}</a>` : ""}
                </p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7;">
                Please be on time and make sure your setup is ready. Good luck! 🚀
            </p>
        `)
    })
}

// 4 — Recruiter notification — new application
export const sendRecruiterNotification = async ({ recruiterEmail, recruiterName, candidateName, jobTitle, fitScore }) => {
    await sendMail({
        to: recruiterEmail,
        subject: `🆕 New Application — ${jobTitle} (AI Score: ${fitScore})`,
        html: baseTemplate(`
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                New Application Received
            </h2>
            <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">
                Hi ${recruiterName}, a new candidate has applied.
            </p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #374151; font-size: 14px; margin: 0; line-height: 2;">
                    <strong>Candidate:</strong> ${candidateName}<br/>
                    <strong>Position:</strong> ${jobTitle}<br/>
                    <strong>AI Fit Score:</strong> 
                    <span style="color: ${fitScore >= 80 ? '#16a34a' : fitScore >= 60 ? '#d97706' : '#dc2626'}; font-weight: 700; font-size: 18px;">
                        ${fitScore}/100
                    </span>
                </p>
            </div>
            <a href="${process.env.CLIENT_URL}/pipeline" 
               style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
                View in Pipeline →
            </a>
        `)
    })
}