import multer from "multer";
import fs from "fs";

// Allowed fields for uploads (images and resume)
const allowedFields = [
  "clientLogo",
  "testimonialProfileImage",
  "teamProfileImage",
  "blogImage",
  "resume",
];

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "./Uploads/";

    switch (file.fieldname) {
      case "clientLogo":
        uploadPath = "./Uploads/ClientLogos";
        break;
      case "testimonialProfileImage":
        uploadPath = "./Uploads/TestimonialProfiles";
        break;
      case "teamProfileImage":
        uploadPath = "./Uploads/TeamProfiles";
        break;
      case "blogImage":
        uploadPath = "./Uploads/BlogImages";
        break;
      case "resume":
        uploadPath = "./Uploads/Resumes";
        break;
      default:
        uploadPath = "./Uploads/Other";
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${cleanName}`);
  },
});

// File filter for specific fields
const fileFilter = (req, file, cb) => {
  if (allowedFields.includes(file.fieldname)) {
    // For resume, allow common document types (pdf, doc, docx)
    if (file.fieldname === "resume") {
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Only PDF, DOC, or DOCX files are allowed for resume"), false);
      }
      return cb(null, true);
    }

    // For all other fields, only allow images
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    return cb(null, true);
  }
  return cb(new Error("Invalid field for upload"), false);
};

export const upload = multer({
  storage,
  fileFilter,
});