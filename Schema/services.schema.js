import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      description: "Unique identifier for the service (used in routes/links etc)"
    },
    title: {
      type: String,
      required: true,
      trim: true,
      description: "Service title for display"
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      description: "Short promotional tagline for the service"
    },
    description: {
      type: String,
      required: true,
      trim: true,
      description: "Detailed description about the service"
    },
    features: {
      type: [String],
      required: true,
      description: "List of major features this service offers"
    }
  },
  { timestamps: true }
);

const ServiceModel = mongoose.model("services", serviceSchema);

export default ServiceModel;