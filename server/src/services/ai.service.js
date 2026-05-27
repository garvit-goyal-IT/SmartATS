import Groq from "groq-sdk"

const getAI = () => new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─── Helper ───────────────────────────────────────────────
const askGroq = async (prompt) => {
    const ai = getAI()
    const response = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
    })
    const raw = response.choices[0].message.content
    const cleaned = raw.replace(/```json|```/g, "").trim()
    return JSON.parse(cleaned)
}

// ─── Resume Parser ────────────────────────────────────────
export const parseResumeWithAI = async (resumeText) => {
    const prompt = `
You are an expert HR assistant. Extract structured information from this resume.
Return ONLY a valid JSON object. No explanation, no markdown, no backticks.

Resume:
${resumeText}

Return exactly this structure:
{
  "personalInfo": {
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "location": "city, country"
  },
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "2 years",
      "description": "brief description"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "university name",
      "year": 2022
    }
  ],
  "totalExperience": 3,
  "keywords": ["keyword1", "keyword2"]
}
`
    return await askGroq(prompt)
}

// ─── Candidate Scorer ─────────────────────────────────────
export const scoreCandidateWithAI = async (parsedResume, job) => {
    
    // handle array or object
    const data = Array.isArray(parsedResume) ? parsedResume[0] : parsedResume

    const prompt = `
You are an expert technical recruiter. Score this candidate for the job.
Return ONLY a valid JSON object. No explanation, no markdown, no backticks.

Job Title: ${job.title}
Required Skills: ${job.requirements.join(", ")}
Nice to Have: ${job.niceToHave?.join(", ") || "none"}
Experience Required: ${job.experienceRequired} years

Candidate Skills: ${(data.skills || []).join(", ")}
Candidate Total Experience: ${data.totalExperience || 0} years

Return exactly this structure:
{
  "fitScore": 85,
  "matchedSkills": ["React", "Node.js"],
  "missingSkills": ["Docker", "AWS"],
  "extraSkills": ["Vue.js"],
  "scoreBreakdown": {
    "skillMatch": 80,
    "experienceMatch": 90,
    "keywordOverlap": 75
  },
  "recommendation": "Strong candidate. Has 8/10 required skills.",
  "shortlistSuggestion": true
}
`
    return await askGroq(prompt)
}

// ─── Duplicate Detector ───────────────────────────────────
export const checkDuplicate = async (Candidate, personalInfo) => {
    const byEmail = await Candidate.findOne({
        "personalInfo.email": personalInfo.email
    })
    if(byEmail) return { isDuplicate: true, duplicateOf: byEmail._id }

    if(personalInfo.phone) {
        const byPhone = await Candidate.findOne({
            "personalInfo.phone": personalInfo.phone
        })
        if(byPhone) return { isDuplicate: true, duplicateOf: byPhone._id }
    }

    return { isDuplicate: false, duplicateOf: null }
}

// ─── Keyword Extractor ────────────────────────────────────
export const extractKeywords = async (text) => {
    const prompt = `
Extract the top 15 professional keywords from this resume.
Return ONLY a JSON array of strings. No explanation, no markdown.
Example: ["React", "Node.js", "MongoDB"]

Resume: ${text.substring(0, 2000)}
`
    return await askGroq(prompt)
}

// ─── Smart Shortlisting ───────────────────────────────────
export const getShortlistSuggestions = async (applications) => {
    const prompt = `
You are a recruiter assistant. From these candidates suggest the top ones to shortlist.
Return ONLY a JSON array. No explanation, no markdown.

Candidates: ${JSON.stringify(applications)}

Return exactly this structure:
[
  {
    "candidateId": "id here",
    "reason": "why this candidate should be shortlisted"
  }
]
`
    return await askGroq(prompt)
}

export const generateInterviewQuestions = async (job, candidate) => {
  const prompt = `
You are an expert technical interviewer. Generate interview questions for this candidate.
Return ONLY a valid JSON array. No explanation, no markdown.

Job Title: ${job.title}
Required Skills: ${job.requirements.join(", ")}
Candidate Skills: ${candidate.skills.join(", ")}
Candidate Experience: ${candidate.totalExperience} years
Missing Skills: ${candidate.missingSkills?.join(", ") || "none"}

Generate 10 questions — mix of technical, behavioral, and situational.
Return exactly this structure:
[
{
  "question": "question text here",
  "type": "technical",
  "difficulty": "medium",
  "purpose": "why you are asking this"
}
]
Types: technical, behavioral, situational
Difficulty: easy, medium, hard
`
  return await askGroq(prompt)
}

export const generateJobDescription = async (jobTitle, department) => {
  const prompt = `
You are an expert HR professional. Generate a complete job posting.
Return ONLY a valid JSON object. No explanation, no markdown.

Job Title: ${jobTitle}
Department: ${department}

Return exactly this structure:
{
"description": "full job description paragraph",
"requirements": ["skill1", "skill2", "skill3", "skill4", "skill5"],
"niceToHave": ["skill1", "skill2", "skill3"],
"responsibilities": ["responsibility1", "responsibility2", "responsibility3"],
"experienceRequired": 3
}
`
  return await askGroq(prompt)
}