import fs from 'fs'
import PdfParse from 'pdf-parse-new'
import Candidate from '../models/candidate.model.js'
import { parseResumeWithAI, checkDuplicate, extractKeywords } from '../services/ai.service.js'

const pdfParser = new PdfParse.SmartPDFParser({ 
    enableFastPath: true,
    oversaturationFactor: 1.5 
})

export const uploadResume = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const {jobId}= req.body
        if(!jobId){
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'Job ID is required' })
        }

        const pdfBuffer= fs.readFileSync(req.file.path)

        const pdfData= await pdfParser.parse(pdfBuffer)
        const resumeText= pdfData.text

        if(!resumeText || resumeText.trim().length < 50){
            return res.status(400).json({ error: 'Could not extract text from PDF. Make sure it is not a scanned image.' })
        }

        const parsedData= await parseResumeWithAI(resumeText, jobId)

        if(!parsedData.personalInfo.email) {
            const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
            if(emailMatch) parsedData.personalInfo.email = emailMatch[0]
        }

        if(!parsedData.personalInfo.phone) {
            const phoneMatch = resumeText.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/)
            if(phoneMatch) parsedData.personalInfo.phone = phoneMatch[0]
        }
        

        const {isDuplicate, duplicateOf}= await checkDuplicate(Candidate, parsedData.personalInfo)

        const candidate= await Candidate.create({
            personalInfo: parsedData.personalInfo,
            resumeUrl: req.file.path,
            resumeText,
            parsedData: {
                skills:          parsedData.skills,
                experience:      parsedData.experience,
                education:       parsedData.education,
                totalExperience: parsedData.totalExperience
            },
            keywords:    parsedData.keywords,
            isDuplicate,
            duplicateOf,
            uploadedBy:  req.user._id
        })

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)

        return res.status(201).json({
            success: true,
            message: isDuplicate 
                ? "Resume uploaded but duplicate candidate detected" 
                : "Resume parsed successfully",
            candidate,
            isDuplicate
        })
    }
    catch(error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        console.error("Resume upload error:", error)
        return res.status(500).json({ message: "Error processing resume", error: error.message })
    }
}


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