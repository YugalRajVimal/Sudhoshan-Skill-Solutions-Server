import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";

const app = express();



const allowedOrigins = [
  "http://localhost:5173", // Vite
  "http://localhost:3000", // optional
  "https://sudhoshan-skill-solutions.onrender.com",
  "https://www.sudhoshan-skill-solutions.onrender.com",
  "https://sudhoshan-skill-solutions-admin.onrender.com",
  "https://www.sudhoshan-skill-solutions-admin.onrender.com",
  "https://sudhosanskillsolutions.in",
  "https://www.sudhosanskillsolutions.in",
  "https://admin.sudhosanskillsolutions.in",
  "https://www.admin.sudhosanskillsolutions.in",
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming origin:", origin);
  
    if (!origin) return callback(null, true);
  
    const isAllowed = allowedOrigins.includes(origin);
  
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

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
