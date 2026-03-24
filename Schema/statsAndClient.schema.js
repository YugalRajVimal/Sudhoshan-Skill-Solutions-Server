import mongoose from "mongoose";

/**
 * NOTE: The set of allowed 'label' and 'icon' values for Stat
 * are defined & enforced at the application/UI layer and should exactly match
 * the hardcoded objects in PlacementPartners.js (lines 100-178).
 *    - label: One of the following (must match PlacementPartners.js order)
 *      - "Candidates Placed"
 *      - "Partner Companies"
 *      - "Colleges Connected"
 *      - "Students Trained"
 *      - "Cities Served"
 *      - "Placement Support"
 *      - "Job-Ready Courses"
 *    - icon: Leave as string reference (for UI mapping)
 *      - "briefcase", "building", "university", "user-graduate", "map-marker-alt", "verified", "bookmarks"
 * The backend schema will allow only these via enum.
 */

const ALLOWED_LABELS = [
  "Candidates Placed",
  "Partner Companies",
  "Colleges Connected",
  "Students Trained",
  "Cities Served",
  "Placement Support",
  "Job-Ready Courses"
];

const ALLOWED_ICONS = [
  "briefcase",       // FaBriefcase
  "building",        // FaBuilding
  "university",      // FaUniversity
  "user-graduate",   // FaUserGraduate
  "map-marker-alt",  // FaMapMarkerAlt
  "verified",        // MdVerified
  "bookmarks"        // BsBookmarksFill
];

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, required: false }, // Path or URL to logo image
    alt: { type: String, required: false }, // Optional accessibility text
    website: { type: String, required: false }, // Optional website link
  },
  { timestamps: true }
);

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, enum: ALLOWED_LABELS }, // Only allowed set, matches PlacementPartners.js
    valueNum: { type: Number, required: true }, // e.g. 100
    valueSuffix: { type: String, default: "" }, // e.g. "+", "%"
    icon: { type: String, required: true, enum: ALLOWED_ICONS }, // Always required, specific set
    color: { type: String, required: false }, // Hex or color class (for accent)
  },
  { timestamps: true }
);

// To embed in a single model or expose separately:
export const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);
export const Stat = mongoose.models.Stat || mongoose.model("Stat", StatSchema);

// If you want a single "placement dashboard" document with these as arrays:
const PlacementStatsAndClientsSchema = new mongoose.Schema(
  {
    stats: [StatSchema],
    clients: [ClientSchema],
  },
  { timestamps: true }
);

export default mongoose.models.PlacementStatsAndClients ||
  mongoose.model("PlacementStatsAndClients", PlacementStatsAndClientsSchema);
