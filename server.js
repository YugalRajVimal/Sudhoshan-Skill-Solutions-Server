import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import router from "./routes.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";

/**
 * CORS ORIGIN TROUBLESHOOTING & FIX
 *
 * The following implementation strictly echoes the incoming Origin BACK *only* if it matches the allowedOrigins array.
 * This prevents misrouting (wrong ACAO origin for the given request) and addresses CORS misbehavior,
 * such as responding with the admin domain to user traffic (or vice versa).
 * 
 * This approach is the recommended, standard-compliant way to do dynamic, secure multi-origin CORS.
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
].filter(Boolean);

const app = express();

// Strict, robust CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next(); // Non-browser/CLI/no Origin -> skip CORS

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization"
    );
    if (req.method === "OPTIONS") {
      // CORS preflight, short-circuit
      return res.sendStatus(200);
    }
    return next();
  } else {
    // Disallowed origin. Do NOT set ACAO. Explicitly reject preflights.
    if (req.method === "OPTIONS") {
      return res.status(403).send("CORS Forbidden: Origin not allowed");
    }
    return res.status(403).json({
      error: "CORS Forbidden: Origin not allowed",
    });
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
