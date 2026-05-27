import express from "express"
import { protect, authorizeRole } from "../middlewares/auth.middleware.js"
import { upload } from "../config/multer.js"
import { uploadResume, getAllCandidates, getCandidateById } from "../controllers/candidate.controller.js"

const router = express.Router()

router.post(
    "/upload",
    protect,
    authorizeRole("admin", "recruiter"),
    upload.single("resume"),
    uploadResume
)

router.get("/",   protect, getAllCandidates)
router.get("/:candidateId", protect, getCandidateById)

export default router