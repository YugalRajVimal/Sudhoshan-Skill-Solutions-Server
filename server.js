import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";

/**
 * CORS ORIGIN TROUBLESHOOTING
 *
 * Your CORS errors show that sometimes the value of Access-Control-Allow-Origin is set
 * to 'https://admin.sudhosanskillsolutions.in' even for requests from 'https://sudhosanskillsolutions.in'.
 * To fix: make 100% sure ONLY the actual requesting origin is echoed as the header,
 * IF that origin is in your allowedOrigins list. The code below guarantees that.
 */

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

// Make sure to use only CORS middleware (do NOT set any CORS headers by hand elsewhere!)
const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // For server-to-server, mobile, or curl requests, no origin header may be present
      if (!origin) return callback(null, true);
      // Echo back ONLY the actual requesting origin if it's allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin); // 'origin' value will be reflected in the header
      }
      // Otherwise, CORS will block with an error
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
    preflightContinue: false, // will handle OPTIONS with CORS response
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
