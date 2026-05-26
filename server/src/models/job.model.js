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

    skillsRequired: [{ type: String }],

    location: { 
        type: String
    },
    jobType: { 
        type: String, 
        enum: ["full-time", "internship", "part-time"]
    },
    salary: { type: String },
    status: {
         type: String, 
         enum: ["open", "closed"], 
         default: "open"
     },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
  },
  { timestamps: true }
);

const jobModel= mongoose.model("Job", jobSchema);

export default jobModel