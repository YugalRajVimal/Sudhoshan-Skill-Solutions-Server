import multer from "multer";
import fs from "fs";

// Allowed image fields
const allowedFields = [
  "clientLogo",
  "testimonialProfileImage",
  "teamProfileImage",
  "blogImage",
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

// File filter for images only for the specified fields
const fileFilter = (req, file, cb) => {
  if (allowedFields.includes(file.fieldname)) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    return cb(null, true);
  }
  return cb(new Error("Invalid field for image upload"), false);
};

export const upload = multer({
  storage,
  fileFilter,
});