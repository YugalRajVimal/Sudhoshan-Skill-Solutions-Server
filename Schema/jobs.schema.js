import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      description: "Job title (e.g., Senior Software Developer)"
    },
    company: {
      type: String,
      required: true,
      trim: true,
      description: "Company offering the job (e.g., TCS)"
    },
    location: {
      type: String,
      required: true,
      trim: true,
      description: "Job location (e.g., Kanpur (Hybrid))"
    },
    salary: {
      type: String,
      required: true,
      trim: true,
      description: "Displayed salary range (e.g., ₹12 - 18 LPA)"
    },
    salaryRange: {
      type: String,
      required: true,
      trim: true,
      description: "Generalized salary range for filtering (e.g., 10+ LPA)"
    },
    type: {
      type: String,
      required: true,
      trim: true,
      description: "Type of job (e.g., Full Time)"
    },
    role: {
      type: String,
      required: true,
      trim: true,
      description: "Role or domain (e.g., IT, Sales, Marketing, HR)"
    }
  },
  { timestamps: true }
);

const JobModel = mongoose.model("jobs", jobSchema);

export default JobModel;