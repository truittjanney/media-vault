import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import albumRoutes from "./routes/album.routes.js";
import mediaRoutes from "./routes/media.routes.js";

dotenv.config();

const app = express();

// Allow requests from the local frontend and configured production frontend
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without a browser origin, such as Postman or health checks
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);

app.use(express.json());

// Basic API route
app.get("/", (req, res) => {
  res.send("MediaVault API is running");
});

// Railway health-check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MediaVault API is healthy",
  });
});

// User Routes
app.use("/api/users", userRoutes);

// Album Routes
app.use("/api/albums", albumRoutes);

// Media Routes
app.use("/api/media", mediaRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
