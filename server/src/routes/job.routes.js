import express from 'express'
import {protect, authorizeRole} from "../middlewares/auth.middleware.js"
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, toggleJobStatus ,generateDescription} from "../controllers/job.controller.js"

const router= express.Router()


router.post("/",protect, authorizeRole("admin","recruiter"), createJob)
router.get("/",protect, getAllJobs)
router.get("/:jobId",protect, getJobById)
router.put("/:jobId",protect, authorizeRole("admin","recruiter"), updateJob)
router.delete("/:jobId",protect, authorizeRole("admin"), deleteJob)
router.patch("/:jobId/status",protect, authorizeRole("admin","recruiter"), toggleJobStatus)
router.post("/:jobId/generate-description", protect, authorizeRole("admin","recruiter"), generateDescription)


export default router