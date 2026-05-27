import Job from '../models/job.model.js';


export const createJob= async(req,res)=>{
    const {
        title,
        description,
        requirements,
        department,
        location,
        niceToHave,
        experienceRequired,
        jobType,
        salary,
        deadline
    }= req.body

    const postedBy= req.user._id

    try {
        const newJob= await Job.create({
            title,
            description,
            requirements,
            department,
            location,
            niceToHave,
            experienceRequired,
            jobType,
            salary,
            deadline,
            postedBy
        })

        return res.status(201).json({success: true,message: "Job created successfully", job: newJob})
    } catch (error) {
        console.error("Error creating job:", error);
        return res.status(500).json({message: "Internal server error"})
    }
}

export const getAllJobs = async (req, res) => {
    try {
        const { status, department, jobType, search } = req.query
        const filter = {}

        if(status)     filter.status = status
        if(department) filter.department = department
        if(jobType)    filter.jobType = jobType
        if(search)     filter.title = { $regex: search, $options: "i" }

        const jobs = await Job.find(filter)
            .populate("postedBy", "name email")
            .sort({ createdAt: -1 })

        return res.status(200).json({ success: true, count: jobs.length, jobs })
    } catch(error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}



export const getJobById= async(req,res)=>{
    const { jobId }= req.params

    try {
        const job= await Job.findById(jobId).populate("postedBy", "name email")

        if(!job){
            return res.status(404).json({message: "Job not found"})
        }

        return res.status(200).json({job})
    } catch (error) {
        console.error("Error fetching job:", error);
        return res.status(500).json({message: "Internal server error"})
    }
}

export const updateJob= async(req,res)=>{
    const { jobId }= req.params

    try {
        const job= await Job.findById(jobId)

        if(!job){
            return res.status(404).json({message: "Job not found"})
        }

        if(req.user.role!=='admin' && job.postedBy.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Unauthorized"})
        }

    
        const updatedJob= await Job.findByIdAndUpdate(jobId, req.body, {new: true})

        return res.status(200).json({success: true,message: "Job updated successfully", job: updatedJob})
    } catch (error) {
        console.error("Error updating job:", error);
        return res.status(500).json({message: "Internal server error"})
    }
}

export const deleteJob= async(req,res)=>{
    const { jobId }= req.params

    try {
        const job= await Job.findById(jobId)

        if(!job){
            return res.status(404).json({message: "Job not found"})
        }

        if(req.user.role!=='admin' && job.postedBy.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Unauthorized"})
        }

    
        await Job.findByIdAndDelete(jobId)

        return res.status(200).json({success: true,message: "Job deleted successfully"})
    } catch (error) {
        console.error("Error deleting job:", error);
        return res.status(500).json({message: "Internal server error"})
    }
}

export const toggleJobStatus= async(req,res)=>{
    const {status}= req.body
    const { jobId }= req.params

    if(status && !["open", "closed","on_hold"].includes(status)) {
        return res.status(400).json({message: "Invalid status value"})
    }
    try {
        const job= await Job.findById(jobId)

        if(!job){
            return res.status(404).json({message: "Job not found"})
        }

        if(req.user.role!=='admin' && job.postedBy.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Unauthorized"})
        }

        job.status= status
        await job.save()

        return res.status(200).json({success: true,message: `Job status updated to ${job.status}`, job})
    } catch (error) {
        console.error("Error toggling job status:", error);
        return res.status(500).json({message: "Internal server error"})
    }
}