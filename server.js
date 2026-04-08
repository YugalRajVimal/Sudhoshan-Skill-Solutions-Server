import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";

/**
 * CORS ORIGIN TROUBLESHOOTING
 *
 * To fix the CORS misrouting bug where the 'Access-Control-Allow-Origin' header
 * is set to the wrong allowed origin (e.g., admin domain instead of the real one),
 * we ensure that ONLY the exact requesting origin is echoed in the response
 * IF AND ONLY IF it is listed in `allowedOrigins`.
 */

const allowedOrigins = [
  "https://sudhosanskillsolutions.in",
  "https://sudhoshan-skill-solutions-admin.onrender.com",
  "https://www.sudhoshan-skill-solutions-admin.onrender.com",
  "https://sudhoshan-skill-solutions.onrender.com",
  "https://www.sudhoshan-skill-solutions.onrender.com",
  
  "https://www.sudhosanskillsolutions.in",
  "https://admin.sudhosanskillsolutions.in",
  "https://www.admin.sudhosanskillsolutions.in",

].filter(Boolean); // Remove undefined if env not set

const app = express();

// Custom CORS handling to prevent incorrect origin reflection
app.use(function (req, res, next) {
  const origin = req.headers.origin;

  if (!origin) {
    // no CORS headers for server-to-server/Postman/curl etc.
    return next();
  }

  // Check if the actual request origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin"); // Important for caches/proxies
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
      // Preflight - advance response now with 200
      return res.sendStatus(200);
    }
    return next();
  } else {
    // Not an allowed origin: do NOT set ACAO, fail preflight explicitly if needed
    if (req.method === "OPTIONS") {
      return res.status(403).send("CORS Forbidden: Origin not allowed");
    }
    return res.status(403).json({ error: "CORS Forbidden: Origin not allowed" });
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8822;

app.use("/Uploads", express.static("Uploads"));

app.get("/", (req, res) => {
  res.send("Welcome to Sudhoshan Skill Solutions App Server");
});

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  connectUsingMongoose();
});
