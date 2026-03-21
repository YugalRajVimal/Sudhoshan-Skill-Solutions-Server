import express from "express";
import AdminController from "../Controllers/Admin/admin.controller.js";
import AdminBlogController from "../Controllers/Admin/blog.controller.js";
import AdminCourcesController from "../Controllers/Admin/cources.controller.js";
import AdminJobController from "../Controllers/Admin/jobs.controller.js";
import AdminServicesController from "../Controllers/Admin/services.controller.js";


const adminRouter = express.Router();
const adminController = new AdminController();
const adminBlogController = new AdminBlogController();
const adminCourcesController = new AdminCourcesController();
const adminJobController = new AdminJobController();
const adminServicesController = new AdminServicesController();

adminRouter.get("/", (req, res) => {
  res.send("Welcome to Sudhoshan Skill Solutions Admin APIs");
});


// Service Management Routes

// Create a new service
adminRouter.post("/services", (req, res) => adminServicesController.createService(req, res));

// Fetch all services, or a specific service by id or slug
adminRouter.get("/services", (req, res) => adminServicesController.fetchServices(req, res));

// Update a service by id or slug
adminRouter.put("/services", (req, res) => adminServicesController.editService(req, res));

// Delete a service by id or slug
adminRouter.delete("/services", (req, res) => adminServicesController.deleteService(req, res));



// Job Management Routes

// Create a new job
adminRouter.post("/jobs", (req, res) => adminJobController.createJob(req, res));

// Fetch jobs: all, or by ID
adminRouter.get("/jobs", (req, res) => adminJobController.fetchJobs(req, res));

// Edit a job by ID
adminRouter.put("/jobs", (req, res) => adminJobController.editJob(req, res));

// Delete a job by ID
adminRouter.delete("/jobs", (req, res) => adminJobController.deleteJob(req, res));



// Course Management Routes

// Create a new course
adminRouter.post("/courses", (req, res) => adminCourcesController.createCourse(req, res));

// Fetch all courses, or a specific course by id or slug
adminRouter.get("/courses", (req, res) => adminCourcesController.fetchCourses(req, res));

// Edit (update) a course by id or slug
adminRouter.put("/courses", (req, res) => adminCourcesController.editCourse(req, res));

// Delete a course by id or slug
adminRouter.delete("/courses", (req, res) => adminCourcesController.deleteCourse(req, res));




// Blog Management Routes

// Create a new blog post
adminRouter.post("/blogs", (req, res) => adminBlogController.createBlog(req, res));

// Fetch blog posts: all, or by ID or slug
adminRouter.get("/blogs", (req, res) => adminBlogController.fetchBlogs(req, res));

// Edit a blog post by ID or slug
adminRouter.put("/blogs", (req, res) => adminBlogController.editBlog(req, res));

// Delete a blog post by ID or slug
adminRouter.delete("/blogs", (req, res) => adminBlogController.deleteBlog(req, res));




export default adminRouter;
