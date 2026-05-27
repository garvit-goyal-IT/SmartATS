import { GoogleGenAI, Type } from "@google/genai"


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const MODEL_NAME = "gemini-2.5-flash" 

// -----RESUME PARSER----------------------------------------
export const parseResumeWithAI = async (resumeText) => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Extract structured information from this resume:\n\n${resumeText}`,
        config: {
            systemInstruction: "You are an expert HR assistant responsible for extracting resume details accurately.",

            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    personalInfo: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            email: { type: Type.STRING },
                            phone: { type: Type.STRING },
                            location: { type: Type.STRING }
                        },
                        required: ["name", "email"]
                    },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    experience: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                company: { type: Type.STRING },
                                duration: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ["title", "company"]
                        }
                    },
                    education: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                degree: { type: Type.STRING },
                                institution: { type: Type.STRING },
                                year: { type: Type.INTEGER }
                            }
                        }
                    },
                    totalExperience: { type: Type.INTEGER },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["personalInfo", "skills", "experience", "totalExperience", "keywords"]
            }
        }
    })

    return JSON.parse(response.text)
}

// ------------- Candidate Scorer ----------------------------------
export const scoreCandidateWithAI = async (parsedResume, job) => {
    const prompt = `
Score this candidate for the target job profile.
Job Title: ${job.title}
Required Skills: ${job.requirements.join(", ")}
Nice to Have: ${job.niceToHave?.join(", ") || "none"}
Experience Required: ${job.experienceRequired} years

Candidate Skills: ${parsedResume.skills.join(", ")}
Candidate Total Experience: ${parsedResume.totalExperience} years
Candidate Keywords: ${parsedResume.keywords.join(", ")}
`

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            systemInstruction: "You are an expert technical recruiter matching candidates against job specifications.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    fitScore: { type: Type.INTEGER },
                    matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    extraSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    scoreBreakdown: {
                        type: Type.OBJECT,
                        properties: {
                            skillMatch: { type: Type.INTEGER },
                            experienceMatch: { type: Type.INTEGER },
                            keywordOverlap: { type: Type.INTEGER }
                        },
                        required: ["skillMatch", "experienceMatch", "keywordOverlap"]
                    },
                    recommendation: { type: Type.STRING },
                    shortlistSuggestion: { type: Type.BOOLEAN }
                },
                required: ["fitScore", "matchedSkills", "missingSkills", "scoreBreakdown", "recommendation", "shortlistSuggestion"]
            }
        }
    })

    return JSON.parse(response.text)
}

// --- Duplicate Detector  -----
export const checkDuplicate = async (Candidate, personalInfo) => {
    const byEmail = await Candidate.findOne({
        "personalInfo.email": personalInfo.email
    })
    if (byEmail) return { isDuplicate: true, duplicateOf: byEmail._id }

    if (personalInfo.phone) {
        const byPhone = await Candidate.findOne({
            "personalInfo.phone": personalInfo.phone
        })
        if (byPhone) return { isDuplicate: true, duplicateOf: byPhone._id }
    }

    return { isDuplicate: false, duplicateOf: null }
}

// --------- Keyword Extractor ---------------------
export const extractKeywords = async (text) => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Extract the top 15 professional keywords from this resume text:\n\n${text.substring(0, 4000)}`,
        config: {
            systemInstruction: "Extract professional keywords as a clean flat list.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    })

    return JSON.parse(response.text)
}

// ------------ Smart Shortlisting --------------------
export const getShortlistSuggestions = async (applications) => {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze these candidate profiles and select the top options for shortlisting:\n\n${JSON.stringify(applications)}`,
        config: {
            systemInstruction: "You are a recruiting assistant making data-driven selections for initial screen rounds.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        candidateId: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    },
                    required: ["candidateId", "reason"]
                }
            }
        }
    })

    return JSON.parse(response.text)
}