import TeamMember from '../../Schema/team.schema.js';
import { deleteUploadedFile } from '../../middlewares/ImageUploadMiddlewares/fileDelete.middleware.js';

class AdminTeamController {
  // Create a new team member
  async createTeamMember(req, res) {
    let imagePath;
    try {
      const { name, role, description, border } = req.body;

      // Uploaded file via multer (teamProfileImage)
      if (req.file) {
        imagePath = req.file.path.replace(/^Uploads[\\/]/, "Uploads/");
      }

      // Accept image path from form field or the uploaded file
      const image = imagePath || req.body.image;

      if (!name || !role || !image || !description) {
        // If we uploaded a file, but missing required field, delete profile image immediately.
        if (req.file) deleteUploadedFile(req.file);
        return res.status(400).json({ error: "Missing required fields." });
      }

      const newMember = new TeamMember({
        name,
        role,
        image, // This should be stored as relative path for frontend to show
        description,
        border
      });

      const savedMember = await newMember.save();
      res.status(201).json(savedMember);
    } catch (error) {
      // If any error and uploaded image exists, remove it to prevent orphan files
      if (req.file) deleteUploadedFile(req.file);
      res.status(500).json({ error: error.message || "Failed to create team member." });
    }
  }

  // Get all team members
  async fetchTeamMembers(req, res) {
    try {
      // Most recent first
      const teamMembers = await TeamMember.find().sort({ createdAt: -1 });
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update a team member by ID
  async editTeamMember(req, res) {
    let imagePath;
    let oldImagePath; // Used if replacing the image
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // If there's a file uploaded (i.e. updating profile photo)
      if (req.file) {
        imagePath = req.file.path.replace(/^Uploads[\\/]/, "Uploads/");
        updateData.image = imagePath;
      }

      // Find current team member (for possible image deletion on update)
      const existingMember = await TeamMember.findById(id);
      if (!existingMember) {
        if (req.file) deleteUploadedFile(req.file);
        return res.status(404).json({ error: "Team member not found." });
      }

      oldImagePath = existingMember.image;

      const updatedMember = await TeamMember.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedMember) {
        if (req.file) deleteUploadedFile(req.file);
        return res.status(404).json({ error: "Team member not found." });
      }

      // If image was replaced, delete old image file (but only if a new one was uploaded and old is not the same as new)
      if (req.file && oldImagePath && oldImagePath !== imagePath) {
        deleteUploadedFile(oldImagePath);
      }

      res.json(updatedMember);
    } catch (error) {
      // On error, clean up uploaded file if present
      if (req.file) deleteUploadedFile(req.file);
      res.status(500).json({ error: error.message || "Failed to edit team member." });
    }
  }

  // Delete a team member by ID (and remove their profile image if any)
  async deleteTeamMember(req, res) {
    try {
      const { id } = req.params;
      const deletedMember = await TeamMember.findByIdAndDelete(id);
      if (!deletedMember) {
        return res.status(404).json({ error: "Team member not found." });
      }

      // Delete the associated profile image file if it exists
      if (deletedMember.image) {
        deleteUploadedFile(deletedMember.image);
      }

      res.json({ message: "Team member deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminTeamController;