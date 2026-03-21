import nodemailer from "nodemailer";
import { deleteUploadedFile } from "../middlewares/ImageUploadMiddlewares/fileDelete.middleware.js";

// NOTE: update the environment variable keys to match your .env or server config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

class MailerController {

  enquiryMail = async (req, res) => {
    // Expecting: fullName, email, phone, location, enquiryFor, message, privacyAgreement
    const {
      fullName,
      email,
      phone,
      location,
      enquiryFor,
      message,
      privacyAgreement,
    } = req.body;

    // Compose fallback for missing values
    const fn = fullName || "—";
    const em = email || "—";
    const ph = phone || "—";
    const loc = location || "—";
    const eqf = enquiryFor || "—";
    const msg = message || "—";
    const priv = privacyAgreement ? "Agreed" : "Not agreed/not checked";

    // -- ADMIN EMAIL (to office) --
    const htmlContent = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;   padding: 20px;">
        <div style="max-width:650px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(51,82,153,0.13); overflow:hidden; border:1.5px solid #e3eaf2;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:28px 0 16px 0;">
            <div style="font-size:2.6rem;margin-bottom:7px;">📥</div>
            <h1 style="margin:0;font-size:2rem;font-weight:bold;">
              New Website Enquiry – Sudhosan Skill Solutions
            </h1>
          </div>
          <div style="padding:34px 30px 22px 30px;">
            <p style="font-size:1.15rem; margin-bottom:1.4em; color:#283870;">
              <span style="font-weight:600;">You've received a new message via the Sudhosan Skill Solutions enquiry form:</span>
            </p>
            <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Full Name:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${fn}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Email Address:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${em}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Phone Number:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${ph}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Location:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${loc}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Enquiry For:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${eqf}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;vertical-align:top;">Message:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">
                  <div style="white-space:pre-line; color:#234;">${msg}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Privacy Policy:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${priv}</td>
              </tr>
            </table>
            <div style="margin-top:30px; padding:16px 20px; background:linear-gradient(101deg,#f6fafc 70%,#f0f5fb 100%); border-radius:8px; color:#4568a3; font-size:0.99rem; text-align:center;">
              If this is an urgent enquiry, please contact the sender directly.<br>
              <span style="color:#f87629;font-weight:500;">Sudhosan Skill Solutions Secretariat</span>
            </div>
          </div>
          <div style="background:#e6eef8; padding:15px 10px; text-align:center; font-size:0.96rem; color:#254077; border-top: 1px solid #e3eaf2;">
            <span style="font-size:0.94em;">Sent securely via <strong>Sudhosan Skill Solutions</strong> Website Contact</span>
          </div>
        </div>
      </div>
    `;

    // -- CONFIRMATION TO USER --
    const confirmationHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;  padding:20px;">
        <div style="max-width:600px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 28px rgba(42,71,125,0.12); overflow:hidden; border:1.5px solid #e2eaf5;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; padding:22px 0 13px 0; text-align:center;">
            <div style="font-size:2.1rem; margin-bottom:8px;">✅</div>
            <h2 style="margin:0;font-size:1.7rem;letter-spacing:0.02em;">Thank You for Contacting Sudhosan Skill Solutions</h2>
            <div style="font-size:1.1rem;opacity:.93;">DREAM | DISCOVER | DELIVER</div>
          </div>
          <div style="padding:29px 30px 22px 30px; color:#28376e;">
            <p style="font-size:1.09rem;margin-bottom:16px;">
              Dear <span style="color:#f87629;font-weight:600;">${fn}</span>,
            </p>
            <p style="margin-bottom:18px;">
              We are grateful for your interest in Sudhosan Skill Solutions.<br>
              Your details have been received. Our team will review your enquiry and get back to you soon.
            </p>
            <div style="margin:22px 0 16px 0; background:linear-gradient(93deg,#fdfcff 60%,#f0f6fd 100%); padding:13px 17px; border-radius:7px;">
              <span style="font-weight:500;color:#f87629;">Your Message:</span>
              <blockquote style="margin:10px 0 0 0; border-left:3px solid #f87629; padding-left:12px; color:#355; background:#fcfdff; border-radius:3px;">
                ${msg || ""}
              </blockquote>
            </div>
            <p style="margin-top:30px;">Best regards,<br><span style="font-weight:600;color:#144bbb;">The Sudhosan Skill Solutions Team</span></p>
          </div>
          <div style="background:#e7eef8; padding:13px; text-align:center; font-size:0.97rem; color:#204090; border-top:1px solid #e5edf9;">
            <span>Sudhosan Skill Solutions ·</span>
            <a href="https://sudhosanskillsolutions.in" style="color:#f87629; font-weight:500; text-decoration:none;">sudhosanskillsolutions.in</a>
            <br>
            <span style="font-size:0.92em;">DREAM | DISCOVER | DELIVER</span>
          </div>
        </div>
      </div>
    `;

    // Email data for admin
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.CONTACT_RECEIVER ,
      subject: `Website Enquiry from ${fn} – Sudhosan Skill Solutions`,
      html: htmlContent,
    };

    // Confirmation mail to the public sender/user, if email provided
    const mailOptions2 = {
      from: process.env.MAILER_USER,
      to: em,
      subject: `Thank You for Contacting Sudhosan Skill Solutions`,
      html: confirmationHtml,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error sending your enquiry to Sudhosan Skill Solutions.");
      }
      // Only send confirmation if sender email provided and valid
      if (em && typeof em === "string" && em.includes("@")) {
        transporter.sendMail(mailOptions2, (error) => {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .send("Your enquiry was received but there was an error sending confirmation email.");
          }
          return res
            .status(200)
            .send(
              "Your enquiry was submitted successfully. A confirmation email was sent to you by Sudhosan Skill Solutions."
            );
        });
      } else {
        return res
          .status(200)
          .send("Your enquiry was submitted to Sudhosan Skill Solutions.");
      }
    });
  };

  contactUsMail = async (req, res) => {
    // Expecting: fullName, email, phone, message
    const { fullName, email, phone, message } = req.body;

    const fn = fullName || "—";
    const em = email || "—";
    const ph = phone || "—";
    const msg = message || "—";

    // -- ADMIN EMAIL (to office) --
    const htmlContent = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;  padding: 20px;">
        <div style="max-width:650px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(51,82,153,0.13); overflow:hidden; border:1.5px solid #e3eaf2;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:28px 0 16px 0;">
            <div style="font-size:2.6rem;margin-bottom:7px;">📩</div>
            <h1 style="margin:0;font-size:2rem;font-weight:bold;">
              Contact Us Form Submission – Sudhosan Skill Solutions
            </h1>
          </div>
          <div style="padding:34px 30px 22px 30px;">
            <p style="font-size:1.1rem; margin-bottom:1.3em; color:#283870;">
              <span style="font-weight:600;">New message from the Contact Us form:</span>
            </p>
            <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Full Name:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${fn}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Email Address:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${em}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Phone Number:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${ph}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Message:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0; white-space:pre-wrap;">${msg}</td>
              </tr>
            </table>
          </div>
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:16px 0;">
            <span style="font-size:0.92em;">DREAM | DISCOVER | DELIVER</span>
          </div>
        </div>
      </div>
    `;

    // Confirmation mail to user
    const confirmationHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;  padding: 20px;">
        <div style="max-width:560px; margin:auto; background:#fff; border-radius:16px; box-shadow:0 8px 32px rgba(51,82,153,0.13); overflow:hidden; border:1.5px solid #e3eaf2;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:24px 0 14px 0;">
            <div style="font-size:2.3rem;margin-bottom:5px;">🤝</div>
            <h1 style="margin:0;font-size:1.6rem;font-weight:bold;">
              Thank You for Reaching Out!
            </h1>
          </div>
          <div style="padding:28px 24px 18px 24px;">
            <p style="font-size:1.04rem; margin-bottom:1.1em; color:#1d335f;">
              Dear ${fn !== "—" ? fn : "Enquirer"},
              <br>
              Your message has been received by the Sudhosan Skill Solutions team. We appreciate your interest and will get back to you as soon as possible.
            </p>
            <div style="background:#f7faff;border-radius:8px;padding:16px; margin-bottom:14px;">
              <p style="margin:0;font-size:0.97rem;line-height:1.7;">
                <strong>For your reference:</strong><br>
                Name: <b>${fn}</b><br>
                Email: <b>${em}</b><br>
                Phone: <b>${ph}</b><br>
                Message: <i>${msg}</i>
              </p>
            </div>
            <p style="font-size:0.99rem;color:#283870;">We'll respond to your request as soon as possible.</p>
          </div>
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:12px 0;">
            <span style="font-size:0.87em;">Sudhosan Skill Solutions Team</span>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.CONTACT_RECEIVER,
      subject: `Contact Us Form: ${fn} – Sudhosan Skill Solutions`,
      html: htmlContent,
    };

    const mailOptions2 = {
      from: process.env.MAILER_USER,
      to: em,
      subject: `Thank You for Contacting Sudhosan Skill Solutions`,
      html: confirmationHtml,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error sending your message to Sudhosan Skill Solutions.");
      }
      // Send confirmation if sender email provided and valid
      if (em && typeof em === "string" && em.includes("@")) {
        transporter.sendMail(mailOptions2, (error) => {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .send("Your message was received but there was an error sending confirmation email.");
          }
          return res
            .status(200)
            .send(
              "Your message was submitted successfully. A confirmation email was sent to you by Sudhosan Skill Solutions."
            );
        });
      } else {
        return res
          .status(200)
          .send("Your message was submitted to Sudhosan Skill Solutions.");
      }
    });
  };
  


  talkToRecruiterMail = async (req, res) => {
    // Expecting: fullName, email, phone, message, resume (file, optional)
    const { fullName, email, phone, message } = req.body;
    // Using multer for file upload; resume may be available as req.file
    const resumeFile = req.file;

    const fn = fullName || "—";
    const em = email || "—";
    const ph = phone || "—";
    const msg = message || "—";

    // -- ADMIN EMAIL (to office/recruiter) --
    const htmlContent = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;  padding: 20px;">
        <div style="max-width:650px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(51,82,153,0.12); overflow:hidden; border:1.5px solid #e3eaf2;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:28px 0 16px 0;">
            <div style="font-size:2.3rem;margin-bottom:7px;">👔</div>
            <h1 style="margin:0;font-size:1.55rem;font-weight:bold;">
              Talk To A Recruiter – New Submission
            </h1>
          </div>
          <div style="padding:34px 30px 22px 30px;">
            <p style="font-size:1.07rem; margin-bottom:1.1em; color:#283870;">
              <span style="font-weight:600;">A candidate submitted their details via the Talk To A Recruiter page:</span>
            </p>
            <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Full Name:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${fn}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Email Address:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${em}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Phone Number:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${ph}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;vertical-align:top;">Message:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">
                  <div style="white-space:pre-line; color:#234;">${msg}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;vertical-align:top;">Resume:</td>
                <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">
                  ${resumeFile && resumeFile.originalname
                    ? `<span style="color:#1a4;">[Attached: ${resumeFile.originalname}]</span>`
                    : "<span style='color:#e39;'>Not uploaded</span>"}
                </td>
              </tr>
            </table>
            <div style="margin-top:26px; font-size:0.97em; color:#a8a;">
              <span>Submission date: ${new Date().toLocaleString()}</span>
            </div>
          </div>
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:12px 0;">
            <span style="font-size:0.87em;">Sudhosan Skill Solutions Career Team</span>
          </div>
        </div>
      </div>
    `;

    // -- CONFIRMATION TO USER --
    const confirmationHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;  padding:20px;">
        <div style="max-width:600px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 28px rgba(42,71,125,0.12); overflow:hidden; border:1.5px solid #e2eaf5;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; padding:22px 0 13px 0; text-align:center;">
            <div style="font-size:2.1rem; margin-bottom:8px;">🤝</div>
            <h2 style="margin:0;font-size:1.4rem;letter-spacing:0.02em;">We Received Your Details</h2>
            <div style="font-size:1.1rem;opacity:.93;">DREAM | DISCOVER | DELIVER</div>
          </div>
          <div style="padding:27px 30px 21px 30px; color:#28376e;">
            <p style="font-size:1.09rem;margin-bottom:16px;">
              Dear <span style="color:#f87629;font-weight:600;">${fn}</span>,
            </p>
            <p style="margin-bottom:18px;">
              Thank you for connecting with our career/recruitment team.<br>
              We’ve received your details and will get back to you very soon.
            </p>
            <div style="margin:22px 0 16px 0; background:linear-gradient(93deg,#fdfcff 60%,#f0f6fd 100%); padding:13px 17px; border-radius:7px;">
              <span style="font-weight:500;color:#f87629;">Your Message:</span>
              <blockquote style="margin:10px 0 0 0; border-left:3px solid #f87629; padding-left:12px; color:#355; background:#fcfdff; border-radius:3px;">
                ${msg || ""}
              </blockquote>
            </div>
            <div style="margin-top:15px; font-size:0.98em;">
              <span style="color:#999;">We treat your details and resume confidentially. For questions, reply to this email.</span>
            </div>
          </div>
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:12px 0;">
            <span style="font-size:0.87em;">Sudhosan Skill Solutions Career Team</span>
          </div>
        </div>
      </div>
    `;

    // Setup mailOptions (to recruiter)
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.RECRUITER_RECEIVER || process.env.CONTACT_RECEIVER,
      subject: `Talk To A Recruiter Submission: ${fn}`,
      html: htmlContent,
      attachments: [],
    };

    if (resumeFile && resumeFile.buffer) {
      mailOptions.attachments.push({
        filename: resumeFile.originalname || "resume",
        content: resumeFile.buffer,
        contentType: resumeFile.mimetype || undefined,
      });
    } else if (resumeFile && resumeFile.path) {
      // If file is stored as file on disk, attach from path
      mailOptions.attachments.push({
        filename: resumeFile.originalname || "resume",
        path: resumeFile.path,
        contentType: resumeFile.mimetype || undefined,
      });
    }

    // Setup mailOptions2 (to user)
    const mailOptions2 = {
      from: process.env.MAILER_USER,
      to: em,
      subject: `We Received Your Details – Sudhosan Skill Solutions`,
      html: confirmationHtml,
    };

    // Define file removal helper (safe delete if file stored on disk)
    const cleanupResumeFile = () => {
      if (resumeFile && resumeFile.path) {
        deleteUploadedFile(resumeFile);
      }
    };

    // Helper to handle successful send case, always cleanup afterwards
    const sendSuccess = (httpMsg) => {
      cleanupResumeFile();
      return res.status(200).send(httpMsg);
    };
    // Helper to handle any error response, always cleanup afterwards
    const sendError = (code, errMsg) => {
      cleanupResumeFile();
      return res.status(code).send(errMsg);
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return sendError(500, "Error sending your details to the recruiter.");
      }
      // Send confirmation if sender email provided and valid
      if (em && typeof em === "string" && em.includes("@")) {
        transporter.sendMail(mailOptions2, (error) => {
          if (error) {
            console.error(error);
            return sendError(
              500,
              "Your details were received, but there was an error sending confirmation email."
            );
          }
          return sendSuccess(
            "Your details were submitted successfully. A confirmation email was sent to you by Sudhosan Skill Solutions."
          );
        });
      } else {
        return sendSuccess(
          "Your details were submitted to our recruiter. Thank you!"
        );
      }
    });
  };

// --- Handle Admission Form Submission ---
admissionMail = async (req, res) => {
  // Expecting: fullName, email, phone, desiredCourse, qualification, notes
  const {
    fullName,
    email,
    phone,
    desiredCourse,
    qualification,
    notes,
  } = req.body || {};

  // Compose fallback for missing values
  const fn = fullName || "—";
  const em = email || "—";
  const ph = phone || "—";
  const crs = desiredCourse || "—";
  const qual = qualification || "—";
  const note = notes || "—";

  // ADMIN EMAIL: Send admission details to office (or other configured receiver)
  const htmlContent = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;   padding: 20px;">
      <div style="max-width:650px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(51,82,153,0.13); overflow:hidden; border:1.5px solid #e3eaf2;">
        <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:28px 0 16px 0;">
          <div style="font-size:2.6rem;margin-bottom:7px;">🎓</div>
          <h1 style="margin:0;font-size:2rem;font-weight:bold;">
            New Admission Form Submission – Sudhosan Skill Solutions
          </h1>
        </div>
        <div style="padding:34px 30px 22px 30px;">
          <p style="font-size:1.15rem; margin-bottom:1.4em; color:#283870;">
            <span style="font-weight:600;">A new admission application was submitted from your website:</span>
          </p>
          <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Full Name:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${fn}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Email Address:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${em}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Phone Number:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${ph}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Desired Course:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${crs}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Educational Qualification:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${qual}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;vertical-align:top;">Additional Notes:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">
                <div style="white-space:pre-line; color:#234;">${note}</div>
              </td>
            </tr>
          </table>
          <p style="font-size:0.99rem; margin-top:1.9em;margin-bottom:14px;color:#888;">The admissions team should review and initiate the next steps as soon as possible.</p>
        </div>
      </div>
    </div>
  `;

  // USER CONFIRMATION EMAIL
  const confirmationHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;  padding:20px;">
      <div style="max-width:550px;margin:auto; background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(33,62,123,0.07);overflow:hidden;">
        <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%);color:#fff;text-align:center;padding:22px 0;">
          <div style="font-size:2.3rem;margin-bottom:6px;">✅</div>
          <h2 style="margin:0;font-size:1.4rem;font-weight:600;letter-spacing:0.02em;">Admission Form Received!</h2>
        </div>
        <div style="padding:30px 26px 28px 26px;">
          <p style="font-size:1.12rem;color:#1c274c;margin-bottom:1em;">
            Hi <b>${fn}</b>,
          </p>
          <p style="margin-bottom:1em;">
            Thank you for applying for admission at Sudhosan Skill Solutions. Our admissions team has received your application and will contact you soon with the next steps.
          </p>
          <div style="font-size:0.98rem;background:#f6f8fa;padding:12px 16px;border-radius:8px;line-height:1.6;margin:24px 0 0 0;">
            <div style="font-weight:600;margin-bottom:4px;color:#1b3d67;">What you submitted:</div>
            <div><b>Desired Course:</b> ${crs}</div>
            <div><b>Qualification:</b> ${qual}</div>
            ${note !== "—" ? `<div><b>Notes:</b> <span style="color:#375;">${note}</span></div>` : ""}
          </div>
          <p style="margin-top:36px;color:#4d6188;font-size:0.96rem;">
            If you have questions or want to update your application, <a href="mailto:info@sudhosanskillsolutions.in" style="color:#f87629;text-decoration:underline;">email us</a>.<br />
            <b>Best wishes,</b><br />
            Team Sudhosan Skill Solutions
          </p>
        </div>
      </div>
    </div>
  `;

  // Setup mailOptions (to admin)
  const mailOptions = {
    from: process.env.MAILER_USER,
    to: process.env.ADMISSION_RECEIVER || process.env.CONTACT_RECEIVER,
    subject: `Admission Form Submission: ${fn}`,
    html: htmlContent,
  };

  // Setup mailOptions2 (to user)
  const mailOptions2 = {
    from: process.env.MAILER_USER,
    to: em,
    subject: `We Received Your Admission Form – Sudhosan Skill Solutions`,
    html: confirmationHtml,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("There was an error submitting your admission form. Please try again later.");
    }
    // Send confirmation if sender email provided and valid
    if (em && typeof em === "string" && em.includes("@")) {
      transporter.sendMail(mailOptions2, (error) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .send("Your form was received, but there was an error sending the confirmation email.");
        }
        return res
          .status(200)
          .send(
            "Your admission form was submitted successfully. A confirmation email was sent to you by Sudhosan Skill Solutions."
          );
      });
    } else {
      return res
        .status(200)
        .send("Your admission form was submitted. Thank you!");
    }
  });
};

subscribeUser = async (req, res) => {
  /*
    API expects req.body to have:
    {
      email: string
    }
    Returns 200 and a message on success, or 400/500 with reason.
  */
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string" || !email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    // Because we can't import at this point, use require() inline
    const SubscribedUser = (await import("../Schema/subscribed-users.schema.js")).default;

    // Check if already subscribed
    const existing = await SubscribedUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(200).json({ message: "This email is already subscribed." });
    }

    // Save new subscriber
    await SubscribedUser.create({ email: email.toLowerCase() });

    // Confirmation mail to subscriber
    const confirmationHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif; padding:24px;">
        <div style="max-width:600px; margin:auto; background:#fff; border-radius:16px; box-shadow:0 6px 25px rgba(51,82,153,0.11); border:1px solid #e3eaf2; overflow:hidden;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:23px 0 13px 0;">
            <h2 style="margin:0;font-size:1.6rem;font-weight:bold;">
              Thank You for Subscribing
            </h2>
          </div>
          <div style="padding:32px 28px 20px 28px;">
            <p style="font-size:1.09rem; color:#283870;">
              Your email (<b>${email}</b>) has been successfully subscribed to Sudhosan Skill Solutions updates.<br><br>
              You'll get periodic updates and news from us.
            </p>
          </div>
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:12px 0;">
            <span style="font-size:0.87em;">Sudhosan Skill Solutions Team</span>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.MAILER_USER,
      to: email,
      subject: "Subscription Confirmed – Sudhosan Skill Solutions",
      html: confirmationHtml,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        // Subscription successful, email sending failed – respond with warning but don't roll back DB for email failure
        return res.status(200).json({
          message: "You have been subscribed, but the confirmation email could not be sent.",
        });
      }
      return res.status(200).json({
        message: "Subscription successful! Please check your email for confirmation.",
      });
    });
  } catch (err) {
    console.error("Error in subscribeUser:", err);
    return res.status(500).json({ error: "There was an error subscribing you. Please try again later." });
  }
};

}

export default MailerController;
