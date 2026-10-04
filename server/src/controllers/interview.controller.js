import Interview from "../models/interview.model.js"
import Application from "../models/application.model.js"
import { sendInterviewScheduled } from "../services/email.service.js"

export const scheduleInterview = async (req, res) => {
    const { applicationId, date, time, mode, meetingLink, duration } = req.body
    const companyId = req.user.companyId
    let moved = false

    try {
        // Atomic and scoped: only a shortlisted application of this company can move on
        const application = await Application.findOneAndUpdate(
            { _id: applicationId, companyId, status: "shortlisted" },
            {
                $set: { status: "interview_scheduled" },
                $push: { statusHistory: { from: "shortlisted", to: "interview_scheduled", by: req.user._id } }
            },
            { new: true }
        )
            .populate("candidate", "personalInfo")
            .populate("job", "title")

        if (!application) {
            return res.status(409).json({ message: "Application not found or not in 'shortlisted' stage" })
        }
        moved = true

        const interview = await Interview.create({
            application: application._id,
            companyId,                       // from the user, never from the body
            interviewer: req.user._id,
            date, time, mode, meetingLink, duration
        })

        // Email failure must not fail the request
        try {
            const candidate = application.candidate
            if (candidate?.personalInfo?.email) {
                await sendInterviewScheduled({
                    candidateName: candidate.personalInfo.name,
                    candidateEmail: candidate.personalInfo.email,
                    jobTitle: application.job?.title || "Position",
                    date, time, mode, meetingLink
                })
            }
        } catch (mailError) {
            console.error("Interview email failed:", mailError.message)
        }

        return res.status(201).json({ success: true, message: "Interview scheduled", interview })
    } catch (error) {
        // Interview creation failed, so put the application back
        if (moved) {
            await Application.updateOne(
                { _id: applicationId, companyId },
                { $set: { status: "shortlisted" } }
            )
        }
        if (error.name === "ValidationError") return res.status(400).json({ message: error.message })
        console.error("Schedule interview error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getInterviews = async (req, res) => {
    try {
        const filter = { companyId: req.user.companyId }
        // Recruiters see their own interviews, hiring managers and admins see the whole company
        if (req.user.role === "recruiter") filter.interviewer = req.user._id

        const interviews = await Interview.find(filter)
            .populate({
                path: "application",
                populate: { path: "candidate", select: "personalInfo" }
            })
            .sort({ date: 1 })
            .lean()

        return res.status(200).json({ success: true, interviews })
    } catch (error) {
        console.error("Get interviews error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateInterview = async (req, res) => {
    try {
        const { feedback, result, status } = req.body
        const companyId = req.user.companyId

        if (result && !["pass", "fail"].includes(result)) {
            return res.status(400).json({ message: "Invalid result" })
        }

        const update = {}
        if (feedback !== undefined) update.feedback = feedback
        if (result !== undefined) update.result = result
        if (status !== undefined) update.status = status

        const interview = await Interview.findOneAndUpdate(
            { _id: req.params.interviewId, companyId },
            { $set: update },
            { new: true, runValidators: true }
        )
        if (!interview) return res.status(404).json({ message: "Interview not found" })

        if (result) {
            const to = result === "pass" ? "interviewed" : "rejected"
            await Application.updateOne(
                { _id: interview.application, companyId, status: "interview_scheduled" },
                {
                    $set: { status: to },
                    $push: { statusHistory: { from: "interview_scheduled", to, by: req.user._id } }
                }
            )
        }

        return res.status(200).json({ success: true, interview })
    } catch (error) {
        if (error.name === "ValidationError") return res.status(400).json({ message: error.message })
        console.error("Update interview error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}