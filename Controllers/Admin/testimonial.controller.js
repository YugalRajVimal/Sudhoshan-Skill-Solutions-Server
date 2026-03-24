import TestimonialModel from "../../Schema/testiimonials.schema.js";
import { deleteUploadedFile } from "../../middlewares/ImageUploadMiddlewares/fileDelete.middleware.js";

class AdminTestimonialController {
  // Create a new testimonial with profile image upload
  async createTestimonial(req, res) {
    let profileImagePath = "";
    try {
      const { name, rating, feedback, companyName } = req.body;

      if (!name || !rating || !feedback) {
        // If an image was uploaded, delete it
        if (req.file) deleteUploadedFile(req.file);
        return res.status(400).json({ error: "Name, rating, and feedback are required." });
      }

      // Get image path if uploaded
      if (req.file && req.file.path) {
        // Save relative path (strip 'Uploads' prefix for portability if desired)
        profileImagePath = req.file.path.replace(/^[./\\]*/, "");
      }

      const newTestimonial = new TestimonialModel({
        name,
        rating,
        feedback,
        image: profileImagePath,
        companyName: companyName || ""
      });

      const savedTestimonial = await newTestimonial.save();
      res.status(201).json(savedTestimonial);
    } catch (error) {
      // Clean up uploaded file if error happened
      if (req.file) deleteUploadedFile(req.file);
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch testimonials: all, or by id
  async fetchTestimonials(req, res) {
    try {
      const { id } = req.query;
      let testimonials;

      if (id) {
        testimonials = await TestimonialModel.findById(id);
        if (!testimonials) return res.status(404).json({ error: "Testimonial not found." });
      } else {
        testimonials = await TestimonialModel.find().sort({ createdAt: -1 });
      }
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit a testimonial by ID -- update profile image file (remove old if replaced)
  async editTestimonial(req, res) {
    let newImagePath = "";
    let oldImagePath = "";
    try {
      const { id } = req.query;
      if (!id) {
        if (req.file) deleteUploadedFile(req.file);
        return res.status(400).json({ error: "Testimonial ID is required for update." });
      }

      const existingTestimonial = await TestimonialModel.findById(id);
      if (!existingTestimonial) {
        if (req.file) deleteUploadedFile(req.file);
        return res.status(404).json({ error: "Testimonial not found." });
      }

      // If new image uploaded, we'll replace the old one and delete it later
      if (req.file && req.file.path) {
        newImagePath = req.file.path.replace(/^[./\\]*/, "");
        oldImagePath = existingTestimonial.image;
      }

      // Prepare update data
      const updateData = {
        ...req.body,
        // Replace image with new path if new upload, else keep existing
        image: newImagePath || existingTestimonial.image
      };

      const updatedTestimonial = await TestimonialModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      // Delete old profile image if replaced and old exists and path is not same as new
      if (oldImagePath && newImagePath && oldImagePath !== newImagePath) {
        deleteUploadedFile(oldImagePath);
      }

      res.json(updatedTestimonial);
    } catch (error) {
      // Clean up just-uploaded file if error occurred
      if (req.file) deleteUploadedFile(req.file);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a testimonial by ID and remove image file
  async deleteTestimonial(req, res) {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Testimonial ID is required for deletion." });

      const testimonial = await TestimonialModel.findById(id);
      if (!testimonial) return res.status(404).json({ error: "Testimonial not found." });

      // Remove profile image file if exists
      if (testimonial.image) {
        deleteUploadedFile(testimonial.image);
      }

      await TestimonialModel.findByIdAndDelete(id);
      res.json({ message: "Testimonial deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminTestimonialController;