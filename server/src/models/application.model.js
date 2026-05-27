import mongoose from "mongoose";

const applicationSchema= new mongoose.Schema({
    
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "candidate",
        required: true 
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job", 
        required: true 
    },
    status: {
      type: String,
      enum: ["applied","screening", "shortlisted", "interview_scheduled","interviewed","offer_sent", "rejected", "hired"],
      default: "applied",
    },
    
    aiAnalysis: {
        matchedSkills:  [{ type: String }],
        missingSkills:  [{ type: String }],
        extraSkills:    [{ type: String }],  
        fitScore:       { type: Number, default: 0 },
        scoreBreakdown: {                   
            skillMatch:      { type: Number, default: 0 },  
            experienceMatch: { type: Number, default: 0 },
            keywordOverlap:  { type: Number, default: 0 }
        },
        recommendation: { type: String, default: "" },
        keywords:       [{ type: String }]
    },

    notes: { 
        type: String, 
        default: "" 
    },
  },
  { timestamps: true }
)

const applicationModel = mongoose.model('application', applicationSchema)

export default applicationModel