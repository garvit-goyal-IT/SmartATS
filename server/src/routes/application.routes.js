import express from "express"
import { protect, authorizeRole } from "../middlewares/auth.middleware.js"
import {
    createApplication,
    getApplicationsByJob,
    updateApplicationStatus,
    getShortlistSuggestions,
    generateQuestions
} from "../controllers/application.controller.js"

const router = express.Router()

router.post("/",                         protect, authorizeRole("admin","recruiter"), createApplication)
router.get("/job/:jobId",                protect, getApplicationsByJob)
router.patch("/:applicationId/status",   protect, authorizeRole("admin","recruiter"), updateApplicationStatus)
router.get("/job/:jobId/shortlist",      protect, getShortlistSuggestions)
router.get("/:applicationId/questions", protect,  generateQuestions)

export default router