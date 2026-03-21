import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      description: "Course serial number"
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      description: "URL-friendly unique identifier for the course"
    },
    title: {
      type: String,
      required: true,
      trim: true,
      description: "Title of the course"
    },
    category: {
      type: String,
      required: true,
      trim: true,
      description: "Primary category of the course"
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      description: "Short tagline for the course"
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      description: "Duration of the course (e.g. 2 Weeks)"
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      description: "Delivery mode (e.g. Online / Zoom)"
    },
    fee: {
      type: String,
      required: true,
      trim: true,
      description: "Course fee (e.g. ₹ 99)"
    },
    certificate: {
      type: String,
      required: true,
      trim: true,
      description: "Certification details (e.g. Yes — On Completion)"
    },
    about: {
      type: String,
      required: true,
      description: "Detailed course description"
    },
    whoIsThisFor: {
      type: String,
      required: true,
      trim: true,
      description: "Target audience for the course"
    },
    whatAchieve: {
      type: String,
      required: true,
      trim: true,
      description: "Expected learning outcomes"
    },
    curriculum: {
      type: [String],
      required: true,
      description: "List of topics/modules covered in the course"
    }
  },
  { timestamps: true }
);

const CourseModel = mongoose.model("courses", courseSchema);

export default CourseModel;