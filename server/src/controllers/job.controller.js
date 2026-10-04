import Job from "../models/job.model.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only these fields can be set or changed from the client
const pick = (body) => {
  const allowed = [
    "title", "description", "requirements", "department", "location",
    "niceToHave", "experienceRequired", "jobType", "salary", "deadline",
  ];
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  );
};

export const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...pick(req.body),
      companyId: req.user.companyId, // from the logged-in user, never from the body
      postedBy: req.user._id,
    });
    return res.status(201).json({ success: true, message: "Job created successfully", job });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating job:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { status, department, jobType, search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const filter = { companyId: req.user.companyId }; // the key fix
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (jobType) filter.jobType = jobType;
    if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, count: jobs.length, total, page, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, companyId: req.user.companyId })
      .populate("postedBy", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, companyId: req.user.companyId },
      { $set: pick(req.body) },
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ success: true, message: "Job updated successfully", job });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error updating job:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.jobId,
      companyId: req.user.companyId,
    });

    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleJobStatus = async (req, res) => {
  const { status } = req.body;

  if (!["open", "closed", "on_hold"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, companyId: req.user.companyId },
      { $set: { status } },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ success: true, message: `Job status updated to ${job.status}`, job });
  } catch (error) {
    console.error("Error toggling job status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const generateDescription = async (req, res) => {
  try {
    const { title, department } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const { generateJobDescription } = await import("../services/ai.service.js");
    const result = await generateJobDescription(title, department || "General");

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error generating description:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};