import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      required: true,
      trim: true
    },
    // This field can be automatically derived on the frontend, but for potential extensibility:
    image: {
      type: String,
      trim: true,
      default: "" // Could be derived from name; optional here
    },
    companyName: {
      type: String,
      trim: true,
      default: "" // Optional company or organization name
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: "testimonials"
  }
);

const TestimonialModel = mongoose.model("testimonials", testimonialSchema);

export default TestimonialModel;
