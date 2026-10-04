import express from 'express'
import { protect, authorizeRole } from "../middlewares/auth.middleware.js"
import {
  createJob, getAllJobs, getJobById, updateJob,
  deleteJob, toggleJobStatus, generateDescription
} from "../controllers/job.controller.js"

const router = express.Router()

// Everyone logged in can view their own company's jobs (scoped in the controller)
router.get("/", protect, getAllJobs)
router.get("/:jobId", protect, getJobById)

// Only hiring managers create and manage jobs
router.post("/", protect, authorizeRole("hiring_manager"), createJob)
router.put("/:jobId", protect, authorizeRole("hiring_manager"), updateJob)
router.patch("/:jobId/status", protect, authorizeRole("hiring_manager"), toggleJobStatus)
router.post("/:jobId/generate-description", protect, authorizeRole("hiring_manager"), generateDescription)

// Deleting: hiring manager or admin (admin can clean up the company's data)
router.delete("/:jobId", protect, authorizeRole("hiring_manager", "admin"), deleteJob)

export default router