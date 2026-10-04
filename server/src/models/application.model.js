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

    statusHistory: [{
        from: String,
        to:   String,
        by:   { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        at:   { type: Date, default: Date.now },
    }],

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "company",
        required: true,
        index: true
    },

    offer: {
    status:      { type: String, enum: ["none", "sent", "accepted", "declined"], default: "none" },
    sentBy:      { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    sentAt:      Date,
    salary:      Number,
    joiningDate: Date,
    message:     String,
    respondedAt: Date,
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


applicationSchema.index({ candidate: 1, job: 1 }, { unique: true })
applicationSchema.index({ companyId: 1, job: 1, status: 1 })


const applicationModel = mongoose.model('application', applicationSchema)

export default applicationModel