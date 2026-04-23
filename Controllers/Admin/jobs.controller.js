import JobModel from "../../Schema/jobs.schema.js";

class AdminJobController {
  // Create a new job
  async createJob(req, res) {
    try {
      const {
        title,
        company,
        location,
        salary,
        salaryRange,
        type,
        role,
        categories,
        minimumQualification, // Added minimumQualification
      } = req.body;
      const newJob = new JobModel({
        title,
        company,
        location,
        salary,
        salaryRange,
        type,
        role,
        categories,
        minimumQualification, // Pass to schema
      });
      const savedJob = await newJob.save();
      res.status(201).json(savedJob);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch jobs: all, or by ID
  async fetchJobs(req, res) {
    try {
      const { id } = req.query;
      let jobs;
      if (id) {
        jobs = await JobModel.findById(id);
        if (!jobs) return res.status(404).json({ error: "Job not found." });
      } else {
        jobs = await JobModel.find();
      }
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit a job by ID
  async editJob(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ error: "Job ID is required for update." });
      const updateData = req.body;
      // minimumQualification will be updated if present in updateData
      const updatedJob = await JobModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedJob)
        return res.status(404).json({ error: "Job not found." });
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Reorder jobs using the new schema with the 'order' field for efficient indexing.
   * This method moves the job with jobId to the given targetIndex, reassigning the 'order'
   * field for all jobs in the correct sequence. Uses jobs.schema.js (with order indexing).
   *
   * Expects body: { jobId: string, targetIndex: number }
   */
  async reorderJobs(req, res) {
    try {
      const { jobId, targetIndex } = req.body;
      if (!jobId || typeof targetIndex !== "number" || isNaN(targetIndex)) {
        return res.status(400).json({ error: "jobId and valid targetIndex are required." });
      }

      // Fetch all jobs ordered by the 'order' field (from new schema, indexed)
      let jobs = await JobModel.find().sort({ order: 1, createdAt: 1, _id: 1 }).lean();

      // If no jobs, nothing to reorder
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return res.status(404).json({ error: "No jobs found to reorder." });
      }

      // Ensure all jobs have valid 'order' values as integers
      const allOrdersPresent = jobs.every(j => typeof j.order === "number" && Number.isInteger(j.order));
      if (!allOrdersPresent) {
        // Re-initialize order values to current array order (using indexed schema)
        await Promise.all(
          jobs.map((job, idx) =>
            JobModel.updateOne({ _id: job._id }, { $set: { order: idx } })
          )
        );
        jobs = await JobModel.find().sort({ order: 1, createdAt: 1, _id: 1 }).lean();
      }

      // Locate the job to move
      const oldIndex = jobs.findIndex(j => String(j._id) === String(jobId));
      if (oldIndex === -1) {
        return res.status(404).json({ error: "Job to move not found." });
      }

      // Clamp the target index within bounds
      const safeTargetIndex = Math.max(0, Math.min(targetIndex, jobs.length - 1));
      if (oldIndex === safeTargetIndex) {
        // Still update to ensure order matches array position for integrity
        await Promise.all(
          jobs.map((job, idx) =>
            JobModel.updateOne({ _id: job._id }, { $set: { order: idx } })
          )
        );
        return res.status(200).json({ message: "No reordering needed; job is already at target position." });
      }

      // Perform the in-memory reordering
      const [movedJob] = jobs.splice(oldIndex, 1);
      jobs.splice(safeTargetIndex, 0, movedJob);

      // Persist the new order back; use indexed 'order' field for future lookups
      await Promise.all(
        jobs.map((job, idx) =>
          JobModel.updateOne({ _id: job._id }, { $set: { order: idx } })
        )
      );

      // Return updated jobs list using order (indexed) sort
      const reorderedJobs = await JobModel.find().sort({ order: 1, createdAt: 1, _id: 1 });

      res.json({
        message: "Jobs reordered successfully.",
        movedJobId: jobId,
        targetIndex: safeTargetIndex,
        jobs: reorderedJobs
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a job by ID
  async deleteJob(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ error: "Job ID is required for deletion." });
      const deletedJob = await JobModel.findByIdAndDelete(id);
      if (!deletedJob)
        return res.status(404).json({ error: "Job not found." });
      res.json({ message: "Job deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminJobController;