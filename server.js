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
  "http://sudhosanskillsolutions.in",
  "http://www.sudhosanskillsolutions.in",
  "http://admin.sudhosanskillsolutions.in",
  "http://www.admin.sudhosanskillsolutions.in",
  process.env.FRONTEND_URL,
];

const app = express();

// Allow only requests from allowedOrigins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl etc
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error("Not allowed by CORS: " + origin),
        false
      );
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
