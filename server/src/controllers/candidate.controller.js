import fs from "fs"
import Candidate from '../models/candidate.model.js'
import { parseResumeWithAI, checkDuplicate, extractKeywords } from '../services/ai.service.js'
import { PDFParse } from "pdf-parse";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    await parser.destroy();
    const resumeText = result.text;

    const aiResponse= await parseResumeWithAI(resumeText)
    return res.status(200).json({
      success: true,
      resumeText,
      parsedData: aiResponse,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Resume parsing failed",
    });
  }
};

export const getAllCandidates = async (req, res) => {
    try {
        const {search, skills, isDuplicate}= req.query
        const filter= {}

        if(search){
            filter['personalInfo.name']= { $regex: search, $options: 'i' }
        }
        if(isDuplicate !== undefined){
            filter.isDuplicate= isDuplicate=== 'true'
        }

        const candidates= await Candidate.find(filter).populate("uploadedBy", "name email").sort({ createdAt: -1 })

        return res.status(200).json({ success: true, candidates })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching candidates", error: error.message })
    }
}

export const getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.candidateId)
            .populate("uploadedBy", "name email")

        if(!candidate) {
            return res.status(404).json({ message: "Candidate not found" })
        }

        return res.status(200).json({ success: true, candidate })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}