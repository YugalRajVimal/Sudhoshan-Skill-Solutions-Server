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
    },
    categories: {
      type: [String],
      default: [],
      description: "Categories describing the job (e.g., ['IT', 'Engineering', 'Management'])"
    },
    minimumQualification: {
      type: String,
      required: false,
      trim: true,
      description: "Minimum qualification required for the job (e.g., B.Tech, MBA, Diploma, 12th Pass, etc.)"
    },
    order: {
      type: Number,
      required: false,
      index: true,
      description: "Ordering integer for manual sorting of jobs"
    }
  },
  { timestamps: true }
);

// Create index on the order field to make ordering/reordering queries efficient
jobSchema.index({ order: 1 });

const JobModel = mongoose.model("jobs", jobSchema);

export default JobModel;