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
import AdminTestimonialController from "./Controllers/Admin/testimonial.controller.js";
import TeamMember from "./Schema/team.schema.js";
import statsAndClientSchema from "./Schema/statsAndClient.schema.js";



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
const adminTestimonialController = new AdminTestimonialController();



router.get("/all-data", async (req, res) => {
  try {
    // Fetch services, courses, jobs, testimonials, team members, stats, and clients/partners
    const [
      services,
      courses,
      jobs,
      testimonials,
      teamMembers,
      stats,
      clients,
    ] = await Promise.all([
      adminServicesController.fetchServices
        ? await (async () => {
            return new Promise((resolve, reject) => {
              adminServicesController.fetchServices(
                { query: {} },
                {
                  json: resolve,
                  status: () => ({ json: reject }),
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
                  status: () => ({ json: reject }),
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
                  status: () => ({ json: reject }),
                }
              );
            });
          })()
        : [],
      adminTestimonialController.fetchTestimonials
        ? await (async () => {
            return new Promise((resolve, reject) => {
              adminTestimonialController.fetchTestimonials(
                { query: {} },
                {
                  json: resolve,
                  status: () => ({ json: reject }),
                }
              );
            });
          })()
        : [],
      // All team members, newest first, or [] on error
      TeamMember
        ? await TeamMember.find().sort({ createdAt: -1 }).lean()
        : [],
      // Fetch all stats (assuming a Stats collection, adapt as needed)
      // You may need to create the appropriate model/controller for stats if not existing
      // Fetch stats (PlacementStatsAndClients: only latest, or [] if none/error)
      (await (async () => {
        try {
          const latestDoc = await statsAndClientSchema.findOne().sort({ createdAt: -1 }).lean();
          return latestDoc?.stats || [];
        } catch (e) {
          return [];
        }
      })()),
      // Fetch clients/partners (PlacementStatsAndClients: only latest, or [] if none/error)
      (await (async () => {
        try {
          const latestDoc = await statsAndClientSchema.findOne().sort({ createdAt: -1 }).lean();
          return latestDoc?.clients || [];
        } catch (e) {
          return [];
        }
      })()),
    ]);

    res.json({
      services,
      courses,
      jobs,
      testimonials,
      teamMembers,
      stats,
      clients,
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
// Job application endpoint (expects multipart/form-data; uses file upload middleware)

// Course enrollment endpoint (expects application/json or form-data)
router.post("/enroll-mail", (req, res) => mailerController.enrollMail(req, res));


router.post(
  "/job-apply",
  upload.single("resume"),
  (req, res) => mailerController.jobApplyMail(req, res)
);


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
