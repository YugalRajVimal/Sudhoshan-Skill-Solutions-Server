import nodemailer from "nodemailer";
import { deleteUploadedFile } from "../middlewares/ImageUploadMiddlewares/fileDelete.middleware.js";
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'; // Requires: npm install quill-delta-to-html


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

// --- Handle Admission Form Submission (updated for new fields) ---
admissionMail = async (req, res) => {
  // Expecting new shape: fullName, email, phone, city, state, course, qualification, notes
  const {
    fullName,
    email,
    phone,
    city,
    state,
    course,
    qualification,
    notes,
  } = req.body || {};

  // Compose fallback for missing values
  const fn = fullName || "—";
  const em = email || "—";
  const ph = phone || "—";
  const cityVal = city || "—";
  const stateVal = state || "—";
  const crs = course || "—";
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
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">City / District:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${cityVal}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">State:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${stateVal}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Course Interest:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${crs}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Highest Qualification:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">${qual}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;vertical-align:top;">Additional Notes:</td>
              <td style="padding:10px 12px;background:#f7faff;border-radius:0 6px 6px 0;">
                <div style="white-space:pre-line; color:#234;">${note}</div>
              </td>
            </tr>
          </table>
          <p style="font-size:0.99rem; margin-top:1.9em;margin-bottom:14px;color:#888;">
            The admissions team should review and initiate the next steps as soon as possible.
          </p>
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
            <div><b>City / District:</b> ${cityVal}</div>
            <div><b>State:</b> ${stateVal}</div>
            <div><b>Course Interest:</b> ${crs}</div>
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

// --- Handle Course Enroll Form Submission ---
enrollMail = async (req, res) => {
  /*
    API expects application/json or form-data with fields:
      name: string,
      email: string,
      phone: string,
      courseTitle: string,
      message: string (optional)
    Responds with status and message.
  */
  try {
    const { name, email, phone, courseTitle, message } = req.body || {};

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !courseTitle
    ) {
      return res.status(400).json({ error: "All fields (except message) are required." });
    }

    const nm = name;
    const em = email;
    const ph = phone;
    const course = courseTitle;
    const msg = message || "—";

    // Compose email HTML for admin/academy team
    const adminHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif; background:#f5f8fa; padding:24px;">
        <div style="max-width:520px; margin:auto; background:white; border-radius:19px; overflow:hidden; border:1.5px solid #2563eb; box-shadow:0 2px 8px 0 #173f6833;">
          <div style="background:linear-gradient(90deg,#164194 70%,#f87629 100%); color:#fff; text-align:center; padding:9px 0; border-top-left-radius: 17px; border-top-right-radius:17px;">
            <span style="font-size:0.98em;">Sudhosan Skill Solutions - Course Enquiry</span>
          </div>
          <div style="padding:22px 25px 30px 25px;">
            <h2 style="color:#194183; margin-top:0; font-size:1.28rem; margin-bottom:1.2em;">New Course Enrollment Request</h2>
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-bottom:1.8em;">
              <tr>
                <td style="color:#436cc1; font-weight:bold; padding:5px 0; width:140px;">Name:</td>
                <td style="color:#194183; padding:5px 0;">${nm}</td>
              </tr>
              <tr>
                <td style="color:#436cc1; font-weight:bold; padding:5px 0;">Email:</td>
                <td style="color:#194183; padding:5px 0;">${em}</td>
              </tr>
              <tr>
                <td style="color:#436cc1; font-weight:bold; padding:5px 0;">Phone:</td>
                <td style="color:#194183; padding:5px 0;">${ph}</td>
              </tr>
              <tr>
                <td style="color:#436cc1; font-weight:bold; padding:5px 0;">Course:</td>
                <td style="color:#194183; padding:5px 0;">${course}</td>
              </tr>
              <tr>
                <td style="color:#436cc1; font-weight:bold; padding:5px 0;">Message:</td>
                <td style="color:#194183; padding:5px 0;">${msg}</td>
              </tr>
            </table>
            <div style="color:#5568ad; font-size:0.97rem;">
              This request was submitted from the Course Page.<br/>
              Please contact the candidate at your earliest convenience.
            </div>
          </div>
          <div style="background:linear-gradient(90deg,#1586f4 60%,#f87629 100%); color:#fff; text-align:center; padding:8px 0; border-bottom-left-radius:17px; border-bottom-right-radius:17px;">
            <span style="font-size:0.92em;">Sudhosan Skill Solutions Team</span>
          </div>
        </div>
      </div>
    `;

    // Compose confirmation mail to user
    const confirmationHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif; background:#f7fafc; padding:24px;">
        <div style="max-width:500px; margin:auto; background:white; border-radius:18px; overflow:hidden; border:1.5px solid #2563eb;">
          <div style="background:linear-gradient(90deg,#164194 70%,#f87629 100%); color:#fff; text-align:center; padding:10px 0; border-top-left-radius: 16px; border-top-right-radius:16px;">
            <span style="font-size:1em;">Sudhosan Skill Solutions – Enrollment Confirmation</span>
          </div>
          <div style="padding:26px 25px 22px 25px;">
            <p style="font-size:1.12rem; color:#194183;">
              Dear <b>${nm}</b>,<br /><br />
              Thank you for your interest in the <b>${course}</b> course at <b>Sudhosan Skill Solutions</b>.<br/>
              <span style="color:#F87629;">Our academic team will contact you soon to guide you through the enrollment process and answer any queries.</span>
              <br /><br/>
              We appreciate your trust in us to advance your skills!
            </p>
          </div>
          <div style="background:linear-gradient(90deg,#1586f4 60%,#f87629 100%); color:#fff; text-align:center; padding:9px 0; border-bottom-left-radius: 16px; border-bottom-right-radius:16px;">
            <span style="font-size:0.92em;">Sudhosan Skill Solutions Academy</span>
          </div>
        </div>
      </div>
    `;

    // Setup mail options (to admin/academy)
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.ADMISSION_RECEIVER || process.env.CONTACT_RECEIVER,
      subject: `Course Enrollment Request: ${course} (${nm})`,
      html: adminHtml,
    };

    // Setup confirmation mail (to user)
    const mailOptions2 = {
      from: process.env.MAILER_USER,
      to: em,
      subject: `Your Enrollment Request for ${course} – Sudhosan Skill Solutions`,
      html: confirmationHtml,
    };

    // Get transporter (using global if exists)
    let transporter = global.transporter;
    if (!transporter) {
      const nodemailerModule = await import("nodemailer");
      transporter = nodemailerModule.default.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });
      global.transporter = transporter;
    }

    // Send admin mail
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Course Enroll sendMail error:", error);
        return res.status(500).send("There was an error submitting your enrollment request. Please try again later.");
      }
      // Send confirmation if sender email valid
      if (em && typeof em === "string" && em.includes("@")) {
        transporter.sendMail(mailOptions2, (error) => {
          if (error) {
            console.error("Course Enroll confirmationMail error:", error);
            return res
              .status(500)
              .send("Your request was received, but there was an error sending the confirmation email.");
          }
          return res
            .status(200)
            .send(
              "Your enrollment request was submitted successfully. A confirmation email was sent to you by Sudhosan Skill Solutions."
            );
        });
      } else {
        return res
          .status(200)
          .send("Your enrollment request was submitted. Thank you!");
      }
    });

  } catch (error) {
    console.error("Course Enroll catch error:", error);
    return res.status(500).send("An error occurred while submitting your enrollment request.");
  }
};


// --- Handle Job Application Submission ---
jobApplyMail = async (req, res) => {
  /*
    API expects multipart/form-data with fields:
      name: string,
      email: string,
      phone: string,
      message: string (optional),
      jobTitle: string,
      jobCompany: string,
      jobLocation: string,
      resume: file (optional),
      classType: string (optional; e.g., "group" or "single")
    Responds with status and message.
  */
  try {
    // 1. Get fields from body and resume file
    const { name, email, phone, message, jobTitle, jobCompany, jobLocation, classType } = req.body || {};
    const resumeFile = req.file || (req.files && req.files.resume);

    // Validate required fields (resume and classType are now optional)
    if (
      !name ||
      !email ||
      !phone ||
      !jobTitle ||
      !jobCompany ||
      !jobLocation
    ) {
      // Cleanup if resume file already uploaded but missing field detected
      if (resumeFile && resumeFile.path) {
        deleteUploadedFile(resumeFile);
      }
      return res.status(400).json({ error: "All fields except resume and class type are required." });
    }

    // Compose cover/form values
    const nm = name || "—";
    const em = email || "—";
    const ph = phone || "—";
    const msg = message || "—";
    const jt = jobTitle || "—";
    const jc = jobCompany || "—";
    const jl = jobLocation || "—";
    let classTypeDisplay = "—";
    if (classType === "group") {
      classTypeDisplay = "Online Group Classes";
    } else if (classType === "single") {
      classTypeDisplay = "Online Single Classes";
    } else if (typeof classType === "string" && classType.trim().length > 0) {
      classTypeDisplay = classType;
    }

    // Compose email HTML for admin/recruiter
    const appliedHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif; padding: 20px;">
        <div style="max-width:650px; margin:auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(51,82,153,0.13); overflow:hidden; border:1.5px solid #e3eaf2;">
          <div style="background:linear-gradient(90deg,#f87629 60%,#144bbb 100%); color:#fff; text-align:center; padding:24px 0 14px 0;">
            <div style="font-size:2.2rem;margin-bottom:6px;">💼</div>
            <h1 style="margin:0;font-size:1.55rem;font-weight:bold;">
              New Job Application – ${jt}
            </h1>
          </div>
          <div style="padding:28px 25px 14px 25px;">
            <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Name:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${nm}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Email:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${em}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Phone:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${ph}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Job Title:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${jt}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Company:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${jc}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Location:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${jl}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Class Type:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;">${classTypeDisplay}</td>
              </tr>
              <tr>
                <td style="padding:9px 11px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Cover Letter / Message:</td>
                <td style="padding:9px 11px;background:#f7faff;border-radius:0 6px 6px 0;white-space:pre-line;">${msg}</td>
              </tr>
            </table>
            <p style="margin-top:14px;font-size:0.97rem;color:#345;">
            ${
              resumeFile
                ? "Resume is attached to this email."
                : "<i>No resume was provided.</i>"
            }
            </p>
          </div>
        </div>
      </div>
    `;

    // Compose confirmation HTML for candidate
    const confClassTypeHtml =
      classTypeDisplay !== "—"
        ? `
          <tr>
            <td style="padding:8px 10px;background:#f7faff;border-radius:6px 0 0 6px;color:#132e66;font-weight:bold;">Class Type:</td>
            <td style="padding:8px 10px;background:#f7faff;border-radius:0 6px 6px 0;">${classTypeDisplay}</td>
          </tr>
        `
        : "";

    const confHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif; padding: 22px;">
        <div style="max-width:550px; margin:auto; background:#fff; border-radius:17px; box-shadow:0 7px 24px rgba(51,82,153,0.14); border:1.2px solid #e3eaf2;">
          <div style="background:linear-gradient(90deg,#1586f4 60%,#f87629 100%); color:#fff; text-align:center; padding:23px 0 11px 0;">
            <h2 style="margin:0;font-size:1.4rem;font-weight:bold;">
              Thank You For Applying!
            </h2>
          </div>
          <div style="padding:27px 22px 15px 22px;">
            <p style="font-size:1.12rem; color:#194183;">
              Dear <b>${nm}</b>,<br /><br />
              We have received your application for the <b>${jt}</b> position at <b>${jc}</b>.<br/>
              ${classTypeDisplay !== "—" ? `<br/>Preferred Class Type: <b>${classTypeDisplay}</b><br/>` : ""}
              <span style="color:#F87629;">Our team will review your application and contact you soon if shortlisted.</span>
              <br /><br/>
              Thank you for applying through Sudhosan Skill Solutions!
            </p>
          </div>
          <div style="background:linear-gradient(90deg,#1586f4 60%,#f87629 100%); color:#fff; text-align:center; padding:9px 0; border-bottom-left-radius: 17px; border-bottom-right-radius:17px;">
            <span style="font-size:0.92em;">Sudhosan Skill Solutions Careers Team</span>
          </div>
        </div>
      </div>
    `;

    // Setup mail options to recruiter/admin
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.JOBS_RECEIVER || process.env.CONTACT_RECEIVER,
      subject: `Job Application – ${jt}: ${nm}`,
      html: appliedHtml,
      ...(resumeFile && resumeFile.path
        ? {
            attachments: [
              {
                filename: resumeFile.originalname || "resume.pdf",
                path: resumeFile.path,
              },
            ],
          }
        : {}),
    };

    // Setup confirmation mail to user
    const mailOptions2 = {
      from: process.env.MAILER_USER,
      to: em,
      subject: `We Received Your Job Application – Sudhosan Skill Solutions`,
      html: confHtml,
    };

    // Import transporter (nodemailer transport, probably already at top scope)
    // Use existing transporter if available, else quick import.
    let transporter = global.transporter;
    if (!transporter) {
      const nodemailerModule = await import("nodemailer");
      transporter = nodemailerModule.default.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });
      global.transporter = transporter;
    }

    // Cleanup helper (delete uploaded file)
    const cleanupResumeFile = () => {
      if (resumeFile && resumeFile.path) {
        deleteUploadedFile(resumeFile);
      }
    };

    // Helper to handle success
    const sendSuccess = (httpMsg) => {
      cleanupResumeFile();
      return res.status(200).send(httpMsg);
    };
    // Helper to handle errors
    const sendError = (code, errMsg) => {
      cleanupResumeFile();
      return res.status(code).send(errMsg);
    };

    // Send admin/recruiter mail
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Job Application sendMail error:", error);
        return sendError(500, "Error sending your application. Please try again later.");
      }
      // Send confirmation if email valid
      if (em && typeof em === "string" && em.includes("@")) {
        transporter.sendMail(mailOptions2, (error) => {
          if (error) {
            console.error("Job Application confirmationMail error:", error);
            return sendError(500, "Application submitted, but confirmation email could not be sent.");
          }
          return sendSuccess(
            "Your application was submitted successfully. A confirmation email was sent to you by Sudhosan Skill Solutions."
          );
        });
      } else {
        return sendSuccess(
          "Your application was submitted. Thank you for applying!"
        );
      }
    });
  } catch (error) {
    console.error("Job Application catch error:", error);
    return res.status(500).send("An error occurred while submitting your application.");
  }
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

// Multi Mailer: Send email to multiple users (for `/api/admin/send-multi-mail` backend endpoint)
// This version accepts Quill Delta "body" if present (as JSON), else uses html (string) as before.
// If "body" includes image ops with data URLs, they're converted to embedded images inside the email HTML.

sendMultiMail = async (req, res) => {
  try {
    // Accepts: { recipients: string[]|string, subject: string, body: string|object }
    let { recipients, subject, body } = req.body;

    // Validate recipients
    if (!recipients || !subject || !body) {
      return res.status(400).json({ error: "Recipients, subject, and body are required." });
    }

    // Support both string (comma/semicolon/space separated) and array
    let recipientList = [];
    if (Array.isArray(recipients)) {
      recipientList = recipients
        .map(e => String(e).trim())
        .filter(e => !!e);
    } else if (typeof recipients === "string") {
      recipientList = recipients
        .split(/[,;\s]+/)
        .map(e => e.trim())
        .filter(e => !!e);
    }
    // Remove duplicates and empty
    recipientList = Array.from(new Set(recipientList)).filter(e => e);

    if (recipientList.length === 0) {
      return res.status(400).json({ error: "At least one valid recipient email is required." });
    }

    // Optionally: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipientList.filter(e => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
      return res.status(400).json({ error: "One or more recipient emails are invalid.", invalidEmails });
    }

    // For safety, limit to e.g. 100 recipients per batch
    if (recipientList.length > 100) {
      return res.status(400).json({ error: "Cannot send to more than 100 recipients at once." });
    }

    // Body processing: Accept both Quill Delta and HTML (string)
    let html = "";
    let attachments = [];

    let isDeltaObj = false;
    // If body is already parsed as object (e.g., req.body.body as parsed json)
    if (typeof body === "object" && Array.isArray(body.ops)) {
      isDeltaObj = true;
    } 
    // If body is a stringified delta
    else if (typeof body === "string" && body.trim().startsWith("[{")) {
      // Try parsing as Quill delta (legacy, some clients send JSON string)
      try {
        let parsed = JSON.parse(body);
        if (Array.isArray(parsed) && parsed.length && parsed[0].insert !== undefined) {
          isDeltaObj = true;
          body = { ops: parsed };
        }
      } catch (err) { /* ignore, not a delta */ }
    }

    // Compose HTML from delta if present, else treat as literal HTML string
    if (isDeltaObj) {
      // Optionally scan for image ops and add as embedded images
      const ops = body.ops;
      let deltaConverter = new QuillDeltaToHtmlConverter(ops, {
        // Add any needed options for html generation
        // For inline styles and embed handling
        inlineStyles: true,
      });

      // Gather inline images to convert to attachments if data-url
      let cidCount = 1;
      let embedImages = [];
      for (let op of ops) {
        if (
          op.insert &&
          typeof op.insert === "object" &&
          op.insert.image &&
          op.insert.image.startsWith("data:image/")
        ) {
          // Assign cid for this embedded image
          const cid = `quillimg${cidCount}@mail`;
          embedImages.push({
            dataUrl: op.insert.image,
            cid,
          });
          op.insert.image = `cid:${cid}`; // Replace image src to cid path
          cidCount++;
        }
      }

      html = deltaConverter.convert();

      // Generate attachments for images
      attachments = embedImages.map(img => {
        // Parse mimetype etc from data url
        const dataUrl = img.dataUrl;
        // Example: data:image/png;base64,xxxxxxx
        const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if(!matches) return null;
        const mimeType = matches[1];
        const base64Data = matches[2];
        let ext = mimeType.split("/")[1];
        return {
          filename: `image.${ext}`,
          content: Buffer.from(base64Data, "base64"),
          cid: img.cid,
          contentType: mimeType,
        };
      }).filter(a => !!a);
    } else {
      // Just treat html as string
      html = body;
      attachments = [];
    }

    // Compose mail options
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: recipientList, // array is supported by nodemailer
      subject: subject,
      html,
      attachments,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("MultiMailer sendMail error:", error);
        return res.status(500).json({ error: "Failed to send emails. Please try again later." });
      }
      // Return info such as accepted/rejected if needed
      return res.status(200).json({
        message: `Email sent successfully to ${info.accepted.length} recipient(s).`,
        accepted: info.accepted,
        rejected: info.rejected,
      });
    });
  } catch (err) {
    console.error("Error in sendMultiMail controller:", err);
    return res.status(500).json({ error: "Server error while sending emails." });
  }
};


}

export default MailerController;
