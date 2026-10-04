import Application from "../models/application.model.js"
import Candidate from "../models/candidate.model.js"
import Job from "../models/job.model.js"
import Company from "../models/company.model.js"
import { scoreCandidateWithAI, getShortlistSuggestions as getAISuggestions,compareCandidatesWithAI } from "../services/ai.service.js"
import { 
    sendApplicationReceived, 
    sendRecruiterNotification ,
    sendStatusUpdate
} from "../services/email.service.js"


const TRANSITIONS = {
    applied:             ["screening", "rejected"],
    screening:           ["shortlisted", "rejected"],
    shortlisted:         ["interview_scheduled", "rejected"],
    interview_scheduled: ["interviewed", "rejected"],
    interviewed:         ["rejected"],
}

export const updateStatus = async (req, res) => {
    const { status } = req.body
    try {
        const app = await Application.findOne({ _id: req.params.applicationId, companyId: req.user.companyId })
        if (!app) return res.status(404).json({ message: "Application not found" })

        if (!TRANSITIONS[app.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot move from ${app.status} to ${status}` })
        }

        app.statusHistory.push({ from: app.status, to: status, by: req.user._id })
        app.status = status
        await app.save()
        return res.status(200).json({ success: true, application: app })
    } catch (error) {
        console.error("Error updating status:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const sendOffer = async (req, res) => {
    const { salary, joiningDate, message } = req.body
    try {
        // The status condition inside the filter makes this atomic, so double clicks can't send two offers
        const app = await Application.findOneAndUpdate(
            { _id: req.params.applicationId, companyId: req.user.companyId, status: "interviewed" },
            {
                $set: {
                    status: "offer_sent",
                    "offer.status": "sent",
                    "offer.sentBy": req.user._id,
                    "offer.sentAt": new Date(),
                    "offer.salary": salary,
                    "offer.joiningDate": joiningDate,
                    "offer.message": message,
                },
                $push: { statusHistory: { from: "interviewed", to: "offer_sent", by: req.user._id } },
            },
            { new: true, runValidators: true }
        )
        if (!app) return res.status(409).json({ message: "Application not found or not in 'interviewed' stage" })
        return res.status(200).json({ success: true, message: "Offer sent", application: app })
    } catch (error) {
        console.error("Error sending offer:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const recordOfferResponse = async (req, res) => {
    const { decision } = req.body // "accepted" | "declined"
    if (!["accepted", "declined"].includes(decision)) {
        return res.status(400).json({ message: "Invalid decision" })
    }
    const newStatus = decision === "accepted" ? "hired" : "rejected"
    try {
        const app = await Application.findOneAndUpdate(
            { _id: req.params.applicationId, companyId: req.user.companyId, status: "offer_sent" },
            {
                $set: { status: newStatus, "offer.status": decision, "offer.respondedAt": new Date() },
                $push: { statusHistory: { from: "offer_sent", to: newStatus, by: req.user._id } },
            },
            { new: true }
        )
        if (!app) return res.status(409).json({ message: "No pending offer found" })
        return res.status(200).json({ success: true, application: app })
    } catch (error) {
        console.error("Error recording response:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const createApplication = async (req, res) => {
    try {
        const { candidateId, jobId } = req.body
        const companyId = req.user.companyId

        const candidate = await Candidate.findOne({ _id: candidateId, companyId })
        if (!candidate) return res.status(404).json({ message: "Candidate not found" })

        const job = await Job.findOne({ _id: jobId, companyId, status: "open" })
        if (!job) return res.status(404).json({ message: "Job not found" })

        const existing = await Application.findOne({ candidate: candidateId, job: job._id })
        if (existing) return res.status(400).json({ message: "Candidate already applied to this job" })

        const data = Array.isArray(candidate.parsedData) ? candidate.parsedData[0] : candidate.parsedData
        const aiResult = await scoreCandidateWithAI(data, job)

        const application = await Application.create({
            candidate: candidateId,
            job: job._id,
            companyId: job.companyId,          
            status: "applied",
            aiAnalysis: {
                matchedSkills:  aiResult.matchedSkills,
                missingSkills:  aiResult.missingSkills,
                extraSkills:    aiResult.extraSkills,
                fitScore:       aiResult.fitScore,
                scoreBreakdown: aiResult.scoreBreakdown,
                recommendation: aiResult.recommendation,
                keywords:       candidate.keywords
            },
            statusHistory: [{ from: null, to: "applied", by: req.user._id }]
        })

        await Job.updateOne({ _id: job._id, companyId }, { $inc: { applicantCount: 1 } })

        try {
            const company = await Company.findById(companyId).select("name").lean()
            if (candidate.personalInfo?.email) {
                await sendApplicationReceived({
                    candidateName:  candidate.personalInfo.name,
                    candidateEmail: candidate.personalInfo.email,
                    jobTitle:       job.title,
                    companyName:    company?.name
                })
            }
            await sendRecruiterNotification({
                recruiterEmail: req.user.email,
                recruiterName:  req.user.name,
                candidateName:  candidate.personalInfo?.name,
                jobTitle:       job.title,
                fitScore:       aiResult.fitScore
            })
        } catch (mailError) {
            console.error("Email failed (application was saved):", mailError.message)
        }

        return res.status(201).json({
            success: true,
            message: "Application created with AI scoring",
            application
        })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Candidate already applied to this job" })
        }
        console.error("Application error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const getApplicationsByCandidate = async (req, res) => {
    try {
        const applications = await Application.find({
            candidate: req.params.candidateId,
            companyId: req.user.companyId
        })
            .populate("job", "title")
            .sort({ "aiAnalysis.fitScore": -1 })
            .lean()

        return res.status(200).json({ success: true, applications })
    } catch (error) {
        console.error("getApplicationsByCandidate error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getApplicationsByJob = async (req, res) => {
    try {
        const applications = await Application.find({
            job: req.params.jobId,
            companyId: req.user.companyId
        })
            .populate("candidate", "personalInfo parsedData keywords")
            .populate("job", "title requirements")
            .sort({ "aiAnalysis.fitScore": -1 })
            .lean()

        return res.status(200).json({ success: true, count: applications.length, applications })
    } catch (error) {
        console.error("getApplicationsByJob error:", error)
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

export const compareApplications = async (req, res) => {
    try {
        const { applicationIds, jobId } = req.body

        if(!applicationIds || applicationIds.length < 2) {
            return res.status(400).json({ message: "Select at least 2 candidates to compare" })
        }

        const applications = await Application.find({
            _id: { $in: applicationIds }
        }).populate("candidate").populate("job", "title requirements experienceRequired")

        if(!applications.length) {
            return res.status(404).json({ message: "Applications not found" })
        }

        const job = applications[0].job

        const candidatesData = applications.map(app => {
            const pd = Array.isArray(app.candidate.parsedData)
                ? app.candidate.parsedData[0]
                : app.candidate.parsedData
            return {
                name:            app.candidate.personalInfo?.name || "Unknown",
                skills:          pd?.skills || [],
                totalExperience: pd?.totalExperience || 0,
                fitScore:        app.fitScore || 0
            }
        })

        const comparison = await compareCandidatesWithAI(candidatesData, job)

        return res.status(200).json({ success: true, comparison, applications })
    } catch(error) {
        console.error("Compare error:", error)
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}