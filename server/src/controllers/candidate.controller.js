import Candidate from "../models/candidate.model.js"
import { parseResumeWithAI } from "../services/ai.service.js"
import { PDFParse } from "pdf-parse"

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" })
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" })
    }

    const parser = new PDFParse({ data: req.file.buffer })
    const result = await parser.getText()
    await parser.destroy()
    const resumeText = result.text

    const parsedData = await parseResumeWithAI(resumeText)
    return res.status(200).json({ success: true, resumeText, parsedData })
  } catch (error) {
    console.error("Resume upload error:", error)
    return res.status(500).json({ success: false, message: "Resume parsing failed" })
  }
}

export const getAllCandidates = async (req, res) => {
  try {
    const { search, isDuplicate } = req.query
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)

    const filter = { companyId: req.user.companyId }   // the key fix
    if (search) filter["personalInfo.name"] = { $regex: escapeRegex(search), $options: "i" }
    if (isDuplicate !== undefined) filter.isDuplicate = isDuplicate === "true"

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .select("-resumeText")                          // big field, not needed in a list
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Candidate.countDocuments(filter),
    ])

    return res.status(200).json({ success: true, total, page, candidates })
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return res.status(500).json({ success: false, message: "Error fetching candidates" })
  }
}

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.candidateId,
      companyId: req.user.companyId,
    }).populate("uploadedBy", "name email")

    if (!candidate) return res.status(404).json({ message: "Candidate not found" })
    return res.status(200).json({ success: true, candidate })
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}