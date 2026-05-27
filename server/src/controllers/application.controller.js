import Application from "../models/application.model.js"
import Candidate from "../models/candidate.model.js"
import Job from "../models/job.model.js"
import { scoreCandidateWithAI, getShortlistSuggestions as getAISuggestions } from "../services/ai.service.js"
import { 
    sendApplicationReceived, 
    sendRecruiterNotification ,
    sendStatusUpdate
} from "../services/email.service.js"


export const createApplication = async (req, res) => {
    try {
        const { candidateId, jobId } = req.body

        const candidate = await Candidate.findById(candidateId)
        if(!candidate) return res.status(404).json({ message: "Candidate not found" })

        const job = await Job.findById(jobId)
        if(!job) return res.status(404).json({ message: "Job not found" })

        const existing = await Application.findOne({ candidate: candidateId, job: jobId })
        if(existing) return res.status(400).json({ message: "Candidate already applied to this job" })


        const data = Array.isArray(candidate.parsedData) ? candidate.parsedData[0] : candidate.parsedData;
        const aiResult = await scoreCandidateWithAI(data, job)

        const application = await Application.create({
            candidate: candidateId,
            job:       jobId,
            fitScore:  aiResult.fitScore,
            aiAnalysis: {
                matchedSkills:  aiResult.matchedSkills,
                missingSkills:  aiResult.missingSkills,
                extraSkills:    aiResult.extraSkills,
                fitScore:       aiResult.fitScore,
                scoreBreakdown: aiResult.scoreBreakdown,
                recommendation: aiResult.recommendation,
                keywords:       candidate.keywords
            },
            status: "applied"
        })

        if(candidate.personalInfo?.email) {
            await sendApplicationReceived({
                candidateName:  candidate.personalInfo.name,
                candidateEmail: candidate.personalInfo.email,
                jobTitle:       job.title,
                companyName:    req.user.company
            })
        }
        await sendRecruiterNotification({
            recruiterEmail: req.user.email,
            recruiterName:  req.user.name,
            candidateName:  candidate.personalInfo.name,
            jobTitle:       job.title,
            fitScore:       aiResult.fitScore
        })

        await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } })

        return res.status(201).json({
            success:    true,
            message:    "Application created with AI scoring",
            application,
            aiAnalysis: aiResult
        })

    } catch(error) {
        console.error("Application error:", error)
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

export const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params

        const applications = await Application.find({ job: jobId })
            .populate("candidate")
            .populate("job", "title requirements")
            .sort({ fitScore: -1 })

        return res.status(200).json({ success: true, count: applications.length, applications })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params
        const { status, notes } = req.body

        const validStatuses = [
            "applied", "screening", "shortlisted",
            "interview_scheduled", "interviewed",
            "offer_sent", "hired", "rejected"
        ]

        if(!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" })
        }

        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status, notes },
            { new: true }
        ).populate("candidate").populate("job", "title")

        if(!application) return res.status(404).json({ message: "Application not found" })
        
        const candidate = await Candidate.findById(application.candidate)
        if(candidate?.personalInfo?.email) {
            await sendStatusUpdate({
                candidateName:  candidate.personalInfo.name,
                candidateEmail: candidate.personalInfo.email,
                jobTitle:       application.job?.title || "Position",
                newStatus:  status
            })
        }

        return res.status(200).json({ success: true, message: "Status updated", application })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getShortlistSuggestions = async (req, res) => {
    try {
        const { jobId } = req.params

        const applications = await Application.find({ job: jobId })
            .populate("candidate", "personalInfo parsedData")
            .sort({ fitScore: -1 })
            .limit(10)

        const formatted = applications.map(app => ({
            candidateId:    app._id,
            candidateName:  app.candidate.personalInfo.name,
            fitScore:       app.fitScore,
            matchedSkills:  app.aiAnalysis?.matchedSkills || [],
            recommendation: app.aiAnalysis?.recommendation || ""
        }))

        const suggestions = await getAISuggestions(formatted)

        return res.status(200).json({ success: true, suggestions })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const generateQuestions = async (req, res) => {
    try {
        const { applicationId } = req.params
        
        const application = await Application.findById(applicationId)
            .populate("candidate")
            .populate("job")
        
        if(!application) return res.status(404).json({ message: "Application not found" })

        const candidateData = {
            skills: Array.isArray(application.candidate.parsedData)
                ? application.candidate.parsedData[0]?.skills || []
                : application.candidate.parsedData?.skills || [],
            totalExperience: Array.isArray(application.candidate.parsedData)
                ? application.candidate.parsedData[0]?.totalExperience || 0
                : application.candidate.parsedData?.totalExperience || 0,
            missingSkills: application.aiAnalysis?.missingSkills || []
        }

        const questions = await generateInterviewQuestions(application.job, candidateData)

        return res.status(200).json({ success: true, questions })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}