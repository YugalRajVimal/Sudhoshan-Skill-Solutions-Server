import express from "express";
import adminRouter from "./Routers/admin.routes.js";
import authRouter from "./Routers/auth.routes.js";
import mongoose from "mongoose";

const crypto = require('crypto');

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

// ====== PHONEPE ORDER CREATION with StandardCheckoutClient ======
import { 
  StandardCheckoutClient, 
  Env, 
  StandardCheckoutPayRequest,
  PgPaymentFlow          // may or may not be needed depending on SDK version
} from "pg-sdk-node";
import Enrollment from "./Schema/enrollment.schema.js";

// Use credentials from environment variables (.env)
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION);
// Accepts: 'PRODUCTION' to go live, else use SANDBOX
const env = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);


const router = express.Router();


// Pre-compute once at startup
const PHONEPE_AUTH_TOKEN = crypto
  .createHash('sha256')
  .update(`${process.env.PHONEPE_WEBHOOK_USERNAME}:${process.env.PHONEPE_WEBHOOK_PASSWORD}`)
  .digest('hex');

const processedWebhooks = new Set();

router.get("/", (req, res) => {
  res.send("Welcome to Sudhoshan Skill Solutions Server APIs");
});

router.use("/auth", authRouter);
router.use("/admin", adminRouter);

// Initialize controllers
const adminServicesController = new AdminServicesController();
const adminCourcesController = new AdminCourcesController();
const adminJobController = new AdminJobController();
const adminBlogController = new AdminBlogController();
const mailerController = new MailerController();
const adminTestimonialController = new AdminTestimonialController();

// Get all services, courses, jobs, testimonials, etc.
router.get("/all-data", async (req, res) => {
  try {
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
      await (async () => {
        try {
          const { default: CourseModel } = await import('./Schema/cources.schema.js');
          return await CourseModel.find().sort({ order: 1, createdAt: 1, _id: 1 }).lean();
        } catch (e) {
          return [];
        }
      })(),
      adminJobController.fetchJobs
        ? await (async () => {
            return new Promise((resolve, reject) => {
              import('./Schema/jobs.schema.js').then(({ default: JobModel }) => {
                JobModel.find().sort({ order: 1, createdAt: 1, _id: 1 }).lean().then(resolve).catch(reject);
              }).catch(reject);
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
      TeamMember
        ? await TeamMember.find().sort({ createdAt: -1 }).lean()
        : [],
      (await (async () => {
        try {
          const latestDoc = await statsAndClientSchema.findOne().sort({ createdAt: -1 }).lean();
          return latestDoc?.stats || [];
        } catch (e) {
          return [];
        }
      })()),
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

// ============ CREATE PHONEPE ORDER ENDPOINT =============
// POST /phonepe/create-order
router.post('/phonepe/create-order', async (req, res) => {
  try {
    console.log("[PhonePe] Step 1: Received /create-order request. req.body:", req.body);

    const {
      amount,
      merchantTransactionId,
      merchantUserId,
      mobileNumber,
      callbackUrl,
      courseId,
      name,
      email,
      phone,
      message,
      classType,
      ...rest
    } = req.body;

    // Prefer phone for DB, fallback to mobileNumber for legacy
    const resolvedPhone = phone || mobileNumber;

    console.log("[PhonePe] Step 2: Destructured body variables.", {
      amount,
      merchantTransactionId,
      merchantUserId,
      mobileNumber,
      callbackUrl,
      courseId,
      name,
      email,
      phone,
      resolvedPhone,
      message,
      classType,
      rest,
    });

    // Validate required fields based on enrollment.schema.js
    const requiredFields = [
      { key: "amount", label: "amount" },
      { key: "merchantTransactionId", label: "merchantTransactionId" },
      { key: "merchantUserId", label: "merchantUserId" },
      { key: "courseId", label: "courseId" },
      { key: "name", label: "name" },
      { key: "email", label: "email" },
      // At least one of phone or mobileNumber is STRICTLY required
      { key: "phoneOrMobile", label: "phone/mobileNumber" },
      { key: "classType", label: "classType" },
    ];
    const missingFields = requiredFields
      .filter(field =>
        field.key === "phoneOrMobile"
          ? !(req.body["phone"] || req.body["mobileNumber"])
          : !req.body[field.key]
      )
      .map(field => field.label);
    console.log("[PhonePe] Step 3: Required fields checked. missingFields:", missingFields);

    if (missingFields.length > 0) {
      console.log("[PhonePe] Step 4: Some required fields are missing.", missingFields);
      return res.status(400).json({
        error: 'Missing required fields: ' + missingFields.join(', '),
      });
    }

    // Use callbackUrl passed by client, or fallback to env.
    const redirectUrl = callbackUrl || process.env.PHONEPE_CALLBACK_URL || undefined;
    console.log("[PhonePe] Step 5: redirectUrl constructed:", redirectUrl);

    // Build the PhonePe order request object
    let requestObj;
    try {
      const builder = StandardCheckoutPayRequest.builder()
        .merchantOrderId(String(merchantTransactionId))
        .amount(Number(amount));
      if (redirectUrl) builder.redirectUrl(redirectUrl);
      requestObj = builder.build();
    } catch (reqBuildErr) {
      console.error("[PhonePe] Error building StandardCheckoutPayRequest", reqBuildErr);
      return res.status(400).json({
        error: "Invalid request for PhonePe order: " + reqBuildErr.message,
      });
    }

    console.log("[PhonePe] Step 6: StandardCheckoutPayRequest built:", requestObj);

    // Make payment request to PhonePe
    let resp;
    try {
      console.log("[PhonePe] Step 7: Initiating payment with client.pay()");
      resp = await client.pay(requestObj);
      console.log("[PhonePe] Step 8: Response from StandardCheckoutClient.pay:", resp);

      // If the API indicates error/deserialization, capture it
      if (
        resp?.status === "ERROR" ||
        (typeof resp?.message === "string" && resp.message.includes("Cannot deserialize value"))
      ) {
        console.log("[PhonePe] Step 9: Detected deserialization error in response");
        throw new Error(resp?.message || "PhonePe deserialization error");
      }
    } catch (sdkErr) {
      // Expose SDK and server errors helpfully to client
      console.error("[PhonePe] Step 10: Exception from client.pay()", sdkErr);
      let errMsg = sdkErr?.message;
      let serverErrDetails = null;
      if (
        errMsg?.includes("Cannot deserialize value of type") ||
        sdkErr?.response?.data?.message?.includes("Cannot deserialize value")
      ) {
        serverErrDetails = {
          serverError: true,
          details: errMsg || sdkErr.response?.data?.message
        };
      }
      console.log("[PhonePe] Step 11: Returning error response for SDK failure", { errMsg, serverErrDetails });
      return res.status(502).json({
        success: false,
        message: errMsg || "Error creating PhonePe order.",
        phonepe: sdkErr.response || sdkErr,
        ...(serverErrDetails ? { serverErrDetails } : {})
      });
    }

    // Support both latest UAT/Prod PhonePe responses - wide matching
    let paymentUrl =
      resp?.data?.instrumentResponse?.redirectInfo?.url ||
      resp?.redirectUrl ||
      resp?.data?.redirectUrl ||
      resp?.redirect_url;

    console.log("[PhonePe] Step 12: paymentUrl extracted:", paymentUrl);

    console.log(courseId);
    console.log(paymentUrl);

    if (paymentUrl) {
      try {
        console.log("[PhonePe] Step 13: Saving Enrollment to database");

        // --- Enforce ObjectId for courseId with user-aware error, else reject with actionable message ---

   

        // NOTE: enrollment.schema.js requires courseId, name, email, phone, classType, amount
        await Enrollment.create({
          courseId,
          name,
          email,
          phone: resolvedPhone,
          message: message || "",
          classType,
          amount: Number(amount) / 100, // Convert paise to INR (schema: amount is Number, in rupees)
          currency: "INR",
          paymentStatus: "pending",
          paymentMethod: "phonepe",
          transactionId: null,
          merchantTransactionId,
          orderId: merchantTransactionId,
        });

        console.log("[PhonePe] Step 14: Enrollment saved for", { courseId, email, merchantTransactionId });
      } catch (enrollErr) {
        // Log only; but keep payment flow alive and still return paymentUrl.
        if (
          enrollErr.name === "ValidationError" &&
          enrollErr.errors &&
          enrollErr.errors.courseId &&
          String(enrollErr.errors.courseId.kind) === "ObjectId"
        ) {
          // DB error due to invalid courseId
          console.error(
            "[PhonePe] Step 15: Error saving Enrollment. Likely invalid courseId (must be 24-hex-char string):",
            courseId,
            enrollErr
          );
        } else {
          // Any other DB error
          console.error("[PhonePe] Step 15: Error saving Enrollment:", enrollErr);
        }
        // Error here is non-blocking: paymentUrl will still be returned
      }

      // Return the paymentUrl for UI to redirect
      console.log("[PhonePe] Step 16: Returning paymentUrl to client");

      return res.json({
        success: true,
        paymentUrl,
        phonepe: resp.data || resp,
      });
    } else {
      // No payment URL/redirect returned - something failed
      console.error("[PhonePe] Step 17: No payment URL returned from PhonePe. Full resp:", resp);
      return res.status(502).json({
        success: false,
        phonepe: resp,
        message: resp?.message || "Failed to initiate payment with PhonePe. No paymentUrl returned."
      });
    }
  } catch (error) {
    // Top-level catch for runtime exceptions
    console.error("[PhonePe] Step 18: Uncaught /create-order exception:", error);
    res.status(500).json({ error: error.message || "PhonePe order creation failed." });
  }
});

router.post('/phonepe/webhook', async (req, res) => {
  // 1. Validate Authorization header FIRST
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== PHONEPE_AUTH_TOKEN) {
    console.warn("[PhonePe Webhook] Unauthorized request — invalid or missing Authorization header");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body;
  console.log("[PhonePe Webhook] Received:", JSON.stringify(body));

  // 2. Idempotency — ignore duplicate webhooks
  const orderId = body?.payload?.orderId || body?.payload?.refundId;
  const eventKey = `${body?.event}:${orderId}`;

  if (orderId && processedWebhooks.has(eventKey)) {
    console.log(`[PhonePe Webhook] Duplicate event ignored: ${eventKey}`);
    return res.status(200).json({ received: true }); // Still return 200
  }

  // 3. Acknowledge IMMEDIATELY (PhonePe expects 2xx within 3-5s)
  res.status(200).json({ received: true });

  // 4. Process asynchronously AFTER responding
  try {
    const { event, payload } = body;

    // Use `event` field (not `type`) and `payload.state` for status
    switch (event) {
      case 'checkout.order.completed':
        if (payload.state === 'COMPLETED') {
          await handleOrderCompleted(payload);
        }
        break;

      case 'checkout.order.failed':
        if (payload.state === 'FAILED') {
          await handleOrderFailed(payload);
        }
        break;

      case 'pg.refund.completed':
        if (payload.state === 'COMPLETED') {
          await handleRefundCompleted(payload);
        }
        break;

      case 'pg.refund.failed':
        if (payload.state === 'FAILED') {
          await handleRefundFailed(payload);
        }
        break;

      default:
        console.warn(`[PhonePe Webhook] Unknown event type: ${event}`);
    }

    if (orderId) processedWebhooks.add(eventKey);

  } catch (err) {
    // Don't let processing errors affect the 200 already sent
    console.error("[PhonePe Webhook] Processing error:", err);
  }
});

// --- Handlers ---

async function handleOrderCompleted(payload) {
  const { merchantOrderId, orderId, amount, paymentDetails } = payload;
  console.log(`[PhonePe] Order completed: ${merchantOrderId}, amount: ${amount}`);
  // TODO: Mark order as paid in your DB
}

async function handleOrderFailed(payload) {
  const { merchantOrderId, paymentDetails } = payload;
  const errorCode = paymentDetails?.[0]?.errorCode;
  console.log(`[PhonePe] Order failed: ${merchantOrderId}, error: ${errorCode}`);
  // TODO: Mark order as failed in your DB
}

async function handleRefundCompleted(payload) {
  const { merchantRefundId, originalMerchantOrderId, amount } = payload;
  console.log(`[PhonePe] Refund completed: ${merchantRefundId} for order ${originalMerchantOrderId}`);
  // TODO: Update refund status in your DB
}

async function handleRefundFailed(payload) {
  const { merchantRefundId, originalMerchantOrderId, errorCode } = payload;
  console.log(`[PhonePe] Refund failed: ${merchantRefundId}, error: ${errorCode}`);
  // TODO: Handle failed refund in your DB
}

// Get all Blogs
router.get("/blogs", (req, res) => adminBlogController.fetchBlogs(req, res));

router.post("/enquiry-mail", (req, res) => mailerController.enquiryMail(req, res));
router.post("/contact-us-mail", (req, res) => mailerController.contactUsMail(req, res));

router.post("/talk-to-recruiter-mail", upload.single("resume"), (req, res) => mailerController.talkToRecruiterMail(req, res));

router.post("/admission-mail", (req, res) => mailerController.admissionMail(req, res));

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

// Route to send a mail to multiple recipients (expects { recipients, subject, body } in req.body)
router.post("/multi-mail", (req, res) => mailerController.sendMultiMail(req, res));

export default router;
