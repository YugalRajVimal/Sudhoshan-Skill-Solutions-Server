
import jwt from "jsonwebtoken";
import ExpiredTokenModel from "../../Schema/expired-token.schema.js";
import { Admin } from "../../Schema/admin.schema.js";

class AuthController {
  // Admin: Check Auth (admin dashboard)
  adminCheckAuth = async (req, res) => {
    try {
      const { id, role } = req.user || {};
      if (!id || role !== "admin") {
        return res.status(401).json({ message: "Unauthorized: Admin only" });
      }

      const admin = await Admin.findOne({ _id: id, role: "admin" });
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      // No status or suspend support in Admin schema, so skip
      return res.status(200).json({
        message: "Admin authorized",
        name: admin.name,
        email: admin.email
      });
    } catch (error) {
      console.error("[adminCheckAuth] Error encountered:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Admin: Sign In → Send OTP
  adminSignin = async (req, res) => {
    try {
      let { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({ message: "Email and role are required" });
      }

      email = email.trim().toLowerCase();
      role = role.trim();

      if (role !== "admin") {
        return res.status(400).json({ message: "Role must be admin for this endpoint" });
      }

      const admin = await Admin.findOne({ email, role: "admin" }).lean();
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Generate 6-digit OTP (or 000000 in dev)
      // const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // For now, set constant OTP
      const otp = "000000";

      // Save OTP with expiry (10 min)
      await Admin.findByIdAndUpdate(
        admin._id,
        {
          otp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          otpGeneratedAt: new Date(),
          otpAttempts: 0
        },
        { new: true }
      );

      // Optionally: Send OTP via email

      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("AdminSignin Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  // Admin: Verify OTP & Generate Token
  adminVerifyAccount = async (req, res) => {
    try {
      let { email, otp, role } = req.body;

      if (!email || !otp || !role) {
        return res.status(400).json({ message: "Email, OTP, and Role are required" });
      }

      email = email.trim().toLowerCase();
      role = role.trim();

      if (role !== "admin") {
        return res.status(400).json({ message: "Invalid user role." });
      }

      // Find admin by email, role and OTP
      const admin = await Admin.findOneAndUpdate(
        {
          email,
          role: "admin",
          otp
        },
        { $unset: { otp: 1 }, lastLogin: new Date(), otpExpiresAt: 1, otpAttempts: 1, otpGeneratedAt: 1 },
        { new: true }
      ).lean();

      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials or OTP" });
      }

      // Generate token
      const tokenPayload = {
        id: admin._id,
        email: admin.email,
        role: "admin"
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

      // NOTE: Do NOT log tokens for admin into ExpiredTokenModel at creation time (that would immediately revoke),
      // only mark them expired on signout. So this is omitted here.

      return res
        .status(200)
        .json({ message: "Account verified successfully", token });
    } catch (error) {
      console.error("AdminVerifyAccount Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  // Admin: Sign Out → Mark token as immediately expired
  signOut = async (req, res) => {
    try {
      // Get token from Authorization header
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
      }

      // Set tokenExpiry to now so it is immediately considered expired
      const now = new Date();

      await ExpiredTokenModel.create({
        token,
        tokenExpiry: now,
      });

      return res.status(200).json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("SignOut Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}

export default AuthController;
