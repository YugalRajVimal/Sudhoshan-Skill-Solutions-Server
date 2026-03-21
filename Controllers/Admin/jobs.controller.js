import JobModel from "../../Schema/jobs.schema.js";

class AdminJobController {
  // Create a new job
  async createJob(req, res) {
    try {
      const { title, company, location, salary, salaryRange, type, role } = req.body;
      const newJob = new JobModel({ title, company, location, salary, salaryRange, type, role });
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
      if (!id) return res.status(400).json({ error: "Job ID is required for update." });
      const updateData = req.body;
      const updatedJob = await JobModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedJob) return res.status(404).json({ error: "Job not found." });
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a job by ID
  async deleteJob(req, res) {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Job ID is required for deletion." });
      const deletedJob = await JobModel.findByIdAndDelete(id);
      if (!deletedJob) return res.status(404).json({ error: "Job not found." });
      res.json({ message: "Job deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminJobController;