import CourseModel from "../../Schema/cources.schema.js";

/**
 * Helper to parse incoming curriculum payload (string or array) into array of strings.
 */
function parseCurriculum(curriculum) {
  if (!curriculum) return [];
  if (Array.isArray(curriculum)) return curriculum.map(i => String(i).trim()).filter(Boolean);
  if (typeof curriculum === "string") {
    // Accept \n or , delimited string
    return curriculum
      .split(/[\n,]/)
      .map(i => i.trim())
      .filter(Boolean);
  }
  return [];
}

class AdminCourcesController {
  // Create a new course
  async createCourse(req, res) {
    try {
      const {
        id,
        slug,
        title,
        category,
        tagline,
        duration,
        mode,
        fee,
        certificate,
        about,
        whoIsThisFor,
        whatAchieve,
        curriculum
      } = req.body;
      const currArray = parseCurriculum(curriculum);

      const newCourse = new CourseModel({
        id,
        slug,
        title,
        category,
        tagline,
        duration,
        mode,
        fee,
        certificate,
        about,
        whoIsThisFor,
        whatAchieve,
        curriculum: currArray
      });
      const savedCourse = await newCourse.save();
      res.status(201).json(savedCourse);
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key (id or slug)
        return res.status(400).json({ error: "Course with this id or slug already exists." });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch all courses, or a specific course by id or slug
  async fetchCourses(req, res) {
    try {
      const { id, slug } = req.query;
      let result;

      if (id) {
        result = await CourseModel.findOne({ id });
        if (!result) return res.status(404).json({ error: "Course not found." });
      } else if (slug) {
        result = await CourseModel.findOne({ slug });
        if (!result) return res.status(404).json({ error: "Course not found." });
      } else {
        result = await CourseModel.find();
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit (update) a course by id or slug
  async editCourse(req, res) {
    try {
      const { id, slug } = req.query;
      const updateData = { ...req.body };

      // If curriculum is provided, always sanitize to array.
      if (Object.prototype.hasOwnProperty.call(updateData, "curriculum")) {
        updateData.curriculum = parseCurriculum(updateData.curriculum);
      }

      let updatedCourse;
      if (id) {
        updatedCourse = await CourseModel.findOneAndUpdate(
          { id },
          updateData,
          { new: true, runValidators: true }
        );
      } else if (slug) {
        updatedCourse = await CourseModel.findOneAndUpdate(
          { slug },
          updateData,
          { new: true, runValidators: true }
        );
      } else {
        return res.status(400).json({ error: "Please provide course id or slug to update." });
      }
      if (!updatedCourse) {
        return res.status(404).json({ error: "Course not found." });
      }

      res.json(updatedCourse);
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key update
        return res.status(400).json({ error: "Course with this id or slug already exists." });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a course by id or slug
  async deleteCourse(req, res) {
    try {
      const { id, slug } = req.query;

      let deletedCourse;
      if (id) {
        deletedCourse = await CourseModel.findOneAndDelete({ id });
      } else if (slug) {
        deletedCourse = await CourseModel.findOneAndDelete({ slug });
      } else {
        return res.status(400).json({ error: "Please provide course id or slug to delete." });
      }
      if (!deletedCourse) {
        return res.status(404).json({ error: "Course not found." });
      }
      res.json({ success: true, message: "Course deleted successfully.", course: deletedCourse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminCourcesController;