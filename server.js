import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";

const allowedOrigins = [
  "https://sudhoshan-skill-solutions-admin.onrender.com",
  "https://www.sudhoshan-skill-solutions-admin.onrender.com",
  "https://sudhoshan-skill-solutions.onrender.com",
  "https://www.sudhoshan-skill-solutions.onrender.com",
  "https://sudhosanskillsolutions.in",
  "https://www.sudhosanskillsolutions.in",
  "https://admin.sudhosanskillsolutions.in",
  "https://www.admin.sudhosanskillsolutions.in",
  process.env.FRONTEND_URL,
];

const app = express();

/**
 * Ensure proper handling of CORS and avoid multiple or conflicting CORS headers.
 * Use ONLY the cors middleware for all the logic.
 * Remove the custom manual CORS header-setting middleware to ensure
 * only one place is setting CORS headers and the header matches the
 * exact value of the requesting origin.
 * 
 * The CORS middleware below:
 *  - will reflect the allowed origin
 *  - will handle credentials and headers correctly
 *  - will short-circuit OPTIONS preflights with proper CORS headers and 204
 */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl etc
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        // Use the exact origin as the value for Access-Control-Allow-Origin
        return callback(null, origin);
      }
      return callback(new Error("Not allowed by CORS: " + origin), false);
    },
    credentials: true,
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 204,
  })
);

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
