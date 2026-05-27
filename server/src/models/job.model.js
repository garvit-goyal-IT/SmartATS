import  mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
         type: String, 
         required: true
    },
    description: { 
        type: String, 
        required: true
    },

    requirements: [{ type: String }],

    department: {
        type: String
    },

    location: { 
        type: String
    },

    niceToHave: [{type : String}],

    experienceRequired: {
        type: Number,
        default: 0
    },
    jobType: { 
        type: String, 
        enum: ["full-time", "internship", "part-time","contract"]
    },

    salary: {
        min:      { type: Number, default: 0 },
        max:      { type: Number, default: 0 },
        currency: { type: String, default: "INR" }
    },

    applicantCount: { 
        type: Number, 
        default: 0
    },

    deadline:{ 
        type: Date,
        required: true
    },
    status: {
         type: String, 
         enum: ["open", "closed","on_hold"], 
         default: "open"
     },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
  },
  { timestamps: true }
);

const jobModel= mongoose.model("Job", jobSchema);

export default jobModel