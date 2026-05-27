import Interview from "../models/interview.model.js"
import Application from "../models/application.model.js"

export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, date, time, mode, meetingLink, duration } = req.body

        const application = await Application.findById(applicationId)
        if(!application) return res.status(404).json({ message: "Application not found" })

        const interview = await Interview.create({
            application: applicationId,
            interviewer: req.user._id,
            date,
            time,
            mode,
            meetingLink,
            duration
        })

        await Application.findByIdAndUpdate(applicationId, { 
            status: "interview_scheduled" 
        })

        return res.status(201).json({ success: true, message: "Interview scheduled", interview })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

export const getInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ interviewer: req.user._id })
            .populate({ 
                path: "application", 
                populate: { path: "candidate", select: "personalInfo" } 
            })
            .sort({ date: 1 })

        return res.status(200).json({ success: true, interviews })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateInterview = async (req, res) => {
    try {
        const { interviewId } = req.params
        const { feedback, result, status } = req.body

        const interview = await Interview.findByIdAndUpdate(
            interviewId,
            { feedback, result, status },
            { new: true }
        )

        if(!interview) return res.status(404).json({ message: "Interview not found" })

        if(result === "pass") {
            await Application.findByIdAndUpdate(
                interview.application, 
                { status: "interviewed" }
            )
        } else if(result === "fail") {
            await Application.findByIdAndUpdate(
                interview.application, 
                { status: "rejected" }
            )
        }

        return res.status(200).json({ success: true, interview })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}