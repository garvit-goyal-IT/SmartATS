import mongoose from "mongoose";

const candidateSchema= new mongoose.Schema({
    personalInfo: {
        name: {
        type: String,
        default: ""
        },
        email :{
        type: String,
        default: ""
         },
        location:{
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default:""
        }
    },

    resumeUrl: {
        type: String,
        default: ""
    },
    resumeText: {
        type: String,
        default: ""
    },
    parsedData: {
        skills: [{type:String}],
        experience: [{
            title: {type:String},
            company: {type:String},
            duration: {type:String},
            description: {type:String}
        }],
        education: [{
            degree: {type:String},
            institution: {type:String},
            year: {type:Number}
        }],
        totalExperience: {
            type:Number,
            default: 0
        }
    },
    keywords: [{type:String}],

    isDuplicate: {
        type:Boolean,
        default: false
    },

    duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'candidate'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

},{ 
    timestamps: true
})

const candidateModel= mongoose.model("candidate", candidateSchema)

export default candidateModel