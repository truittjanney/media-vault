import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import albumRoutes from "./routes/album.routes.js";
import mediaRoutes from "./routes/media.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("MediaVault API is running");
});

// User Routes
app.use("/api/users", userRoutes);

// Album Routes
app.use("/api/albums", albumRoutes);

// Media Routes
app.use("/api/media", mediaRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
