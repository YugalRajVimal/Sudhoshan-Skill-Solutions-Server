import express from "express";

import AuthController from "../Controllers/AuthController/auth.controller.js";
import jwtAuth from "../middlewares/Auth/auth.middleware.js";
// import SuperAdminAuthController from "../Controllers/AuthController/super-admin.auth.controller.js";

const authRouter = express.Router();

const authController = new AuthController();


// ===== ADMIN AUTH ROUTES =====
authRouter.post("/admin/check-auth", jwtAuth, authController.adminCheckAuth);
authRouter.post("/admin/signin", authController.adminSignin);
authRouter.post("/admin/verify-account", authController.adminVerifyAccount);






export default authRouter;
