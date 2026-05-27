import express from "express"
import { protect, authorizeRole } from "../middlewares/auth.middleware.js"
import { scheduleInterview, getInterviews, updateInterview } from "../controllers/interview.controller.js"

const router = express.Router()

router.post("/",              protect, authorizeRole("admin","recruiter","hiring_manager"), scheduleInterview)
router.get("/",               protect, getInterviews)
router.patch("/:interviewId", protect, authorizeRole("admin","recruiter","hiring_manager"), updateInterview)

export default router