import  mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "application",
        required: true 
    },
    interviewer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    mode: { 
        type: String,
        enum: ["video", "phone", "onSite"], 
        default: "video"
    },
    meetingLink: { 
        type: String, 
        default: "" 
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled", "rescheduled"],
        default: "scheduled"
    },
    duration: {
        type: Number,   
        default: 60
    },
    notes: {
        type: String,
        default: ""
    },
    feedback: { 
        type: String,
         default: ""
    },
    result: { 
        type: String, 
        enum: ["pending", "pass", "fail"],
        default: "pending" 
    },
  },
  { timestamps: true }
);

const interviewModel= mongoose.model("Interview", interviewSchema);

export default interviewModel