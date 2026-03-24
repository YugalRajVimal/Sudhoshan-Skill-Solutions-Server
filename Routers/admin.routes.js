import express from "express";
import AdminController from "../Controllers/Admin/admin.controller.js";
import AdminBlogController from "../Controllers/Admin/blog.controller.js";
import AdminCourcesController from "../Controllers/Admin/cources.controller.js";
import AdminJobController from "../Controllers/Admin/jobs.controller.js";
import AdminServicesController from "../Controllers/Admin/services.controller.js";
import AdminTestimonialController from "../Controllers/Admin/testimonial.controller.js";
import AdminTeamController from "../Controllers/Admin/team.controller.js";
import AdminStatsAndClientController from "../Controllers/Admin/statsAndClient.controller.js";
import { upload } from "../middlewares/ImageUploadMiddlewares/fileUpload.middleware.js";


const adminRouter = express.Router();
const adminController = new AdminController();
const adminBlogController = new AdminBlogController();
const adminCourcesController = new AdminCourcesController();
const adminJobController = new AdminJobController();
const adminServicesController = new AdminServicesController();
const adminTestimonialController = new AdminTestimonialController();
const adminTeamController = new AdminTeamController();
const adminStatsAndClientController = new AdminStatsAndClientController();

adminRouter.get("/", (req, res) => {
  res.send("Welcome to Sudhoshan Skill Solutions Admin APIs");
});

// Service Management Routes
adminRouter.post("/services", (req, res) => adminServicesController.createService(req, res));
adminRouter.get("/services", (req, res) => adminServicesController.fetchServices(req, res));
adminRouter.put("/services", (req, res) => adminServicesController.editService(req, res));
adminRouter.delete("/services", (req, res) => adminServicesController.deleteService(req, res));

// Job Management Routes
adminRouter.post("/jobs", (req, res) => adminJobController.createJob(req, res));
adminRouter.get("/jobs", (req, res) => adminJobController.fetchJobs(req, res));
adminRouter.put("/jobs", (req, res) => adminJobController.editJob(req, res));
adminRouter.delete("/jobs", (req, res) => adminJobController.deleteJob(req, res));

// Course Management Routes
adminRouter.post("/courses", (req, res) => adminCourcesController.createCourse(req, res));
adminRouter.get("/courses", (req, res) => adminCourcesController.fetchCourses(req, res));
adminRouter.put("/courses", (req, res) => adminCourcesController.editCourse(req, res));
adminRouter.delete("/courses", (req, res) => adminCourcesController.deleteCourse(req, res));

// Blog Management Routes
adminRouter.post("/blogs", (req, res) => adminBlogController.createBlog(req, res));
adminRouter.get("/blogs", (req, res) => adminBlogController.fetchBlogs(req, res));
adminRouter.put("/blogs", (req, res) => adminBlogController.editBlog(req, res));
adminRouter.delete("/blogs", (req, res) => adminBlogController.deleteBlog(req, res));



adminRouter.post(
  "/testimonials",
  upload.single("testimonialProfileImage"),
  (req, res) => adminTestimonialController.createTestimonial(req, res)
);
adminRouter.get("/testimonials", (req, res) =>
  adminTestimonialController.fetchTestimonials(req, res)
);
adminRouter.put(
  "/testimonials",
  upload.single("testimonialProfileImage"),
  (req, res) => adminTestimonialController.editTestimonial(req, res)
);
adminRouter.delete("/testimonials", (req, res) =>
  adminTestimonialController.deleteTestimonial(req, res)
);

// Team Management Routes
// Team Management Routes with Profile Image Upload
adminRouter.post(
  "/teams",
  upload.single("teamProfileImage"),
  (req, res) => adminTeamController.createTeamMember(req, res)
);
adminRouter.get("/teams", (req, res) => adminTeamController.fetchTeamMembers(req, res));
adminRouter.put(
  "/teams/:id",
  upload.single("teamProfileImage"),
  (req, res) => adminTeamController.editTeamMember(req, res)
);
adminRouter.delete("/teams/:id", (req, res) => adminTeamController.deleteTeamMember(req, res));

// Placement Stats & Clients Management Routes


// Fetch single placement stats & clients document (singleton)
adminRouter.get("/placement-dashboard", (req, res) => adminStatsAndClientController.getPlacementStatsAndClients(req, res));

// Update only the stats array in singleton
adminRouter.put("/placement-dashboard/stats", (req, res) => adminStatsAndClientController.updateStats(req, res));

// Update only the clients array in singleton (supports editing logo)
adminRouter.put(
  "/placement-dashboard/clients",
  upload.single("clientLogo"),
  (req, res) => adminStatsAndClientController.updateClients(req, res)
);

// Add a single client to clients array WITH clientLogo image upload middleware
adminRouter.post(
  "/placement-dashboard/clients",
  upload.single("clientLogo"),
  (req, res) => adminStatsAndClientController.addClient(req, res)
);

// Add a single stat to stats array
adminRouter.post("/placement-dashboard/stats", (req, res) => adminStatsAndClientController.addStat(req, res));



// Remove a stat from stats array by ID
adminRouter.delete("/placement-dashboard/stats/:id", (req, res) => adminStatsAndClientController.deleteStat(req, res));

// Remove a client from clients array by ID
adminRouter.delete("/placement-dashboard/clients/:id", (req, res) => adminStatsAndClientController.deleteClient(req, res));

// Replace the entire stats and clients arrays in singleton
adminRouter.put("/placement-dashboard", (req, res) => adminStatsAndClientController.updateStatsAndClients(req, res));

export default adminRouter;
