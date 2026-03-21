import express from "express";
import adminRouter from "./Routers/admin.routes.js";
import authRouter from "./Routers/auth.routes.js";
// Endpoint to get all services, courses, and jobs together

import AdminServicesController from "./Controllers/Admin/services.controller.js";
import AdminCourcesController from "./Controllers/Admin/cources.controller.js";
import AdminJobController from "./Controllers/Admin/jobs.controller.js";
import AdminBlogController from "./Controllers/Admin/blog.controller.js";
import MailerController from "./Controllers/mailer.controller.js";
import { upload } from "./middlewares/ImageUploadMiddlewares/fileUpload.middleware.js";
import SubscribedUser from "./Schema/subscribed-users.schema.js";



const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to Sudhoshan Skill Solutions Server APIs");
});

router.use("/auth", authRouter);
router.use("/admin", adminRouter);


// Instantiate the controllers
const adminServicesController = new AdminServicesController();
const adminCourcesController = new AdminCourcesController();
const adminJobController = new AdminJobController();
const adminBlogController = new AdminBlogController();
const mailerController = new MailerController();




router.get("/all-data", async (req, res) => {
  try {
    // Use the real controller methods directly, not with fake req/res
    // These controller methods expect (req, res) but for this endpoint, 
    // it's more robust to query the models directly for raw data.

    // Assuming you want public, all-data (not admin-only, so "fetch" not "create"/"edit")
    // You could import the models directly here for a more robust aggregation.

    const [
      services,
      courses,
      jobs
    ] = await Promise.all([
      adminServicesController.fetchServices
        ? await (async () => {
            // fetchServices expects req and res, so simulate response handling with a Promise
            return new Promise((resolve, reject) => {
              adminServicesController.fetchServices(
                { query: {} }, 
                { 
                  json: resolve, 
                  status: () => ({ json: reject })
                }
              );
            });
          })()
        : [],
      adminCourcesController.fetchCourses
        ? await (async () => {
            return new Promise((resolve, reject) => {
              adminCourcesController.fetchCourses(
                { query: {} }, 
                { 
                  json: resolve, 
                  status: () => ({ json: reject })
                }
              );
            });
          })()
        : [],
      adminJobController.fetchJobs
        ? await (async () => {
            return new Promise((resolve, reject) => {
              adminJobController.fetchJobs(
                { query: {} }, 
                { 
                  json: resolve, 
                  status: () => ({ json: reject })
                }
              );
            });
          })()
        : [],
    ]);

    res.json({
      services,
      courses,
      jobs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch data." });
  }
});

// Get all Blogs


router.get("/blogs", (req, res) => adminBlogController.fetchBlogs(req, res));





router.post("/enquiry-mail", (req, res) => mailerController.enquiryMail(req, res));
router.post("/contact-us-mail", (req, res) => mailerController.contactUsMail(req, res));

router.post("/talk-to-recruiter-mail", upload.single("resume"), (req, res) => mailerController.talkToRecruiterMail(req, res));

router.post("/admission-mail", (req, res) => mailerController.admissionMail(req, res));

// Newsletter subscribe endpoint
router.post("/subscribe-newsletter", (req, res) => mailerController.subscribeUser(req, res));
// Get all subscribed newsletter users (for admin/reporting/dashboard)


router.get("/subscribed-users", async (req, res) => {
  try {
    const users = await SubscribedUser.find({}, { email: 1, subscribedAt: 1, _id: 0 }).sort({ subscribedAt: -1 });
    res.json({ subscribedUsers: users });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to fetch subscribed users." });
  }
});






export default router;
