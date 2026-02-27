import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../routes/authRoutes.js";
import farmerRoutes from "../routes/farmerRoutes.js";
import cropsRoutes from "../routes/cropsRoutes.js";
import marketRoutes from "../routes/marketRoutes.js";
import weatherRoutes from "../routes/weatherRoutes.js";
import recommendationRoutes from "../routes/recommendationRoutes.js";
import statsRoutes from "../routes/statsRoutes.js";
import preservationRoutes from "../routes/preservationRoutes.js";
import traderRoutes from "../routes/traderRoutes.js";

dotenv.config();

const app = express();

// Configure CORS to allow all origins for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Agrichain API running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/crops", cropsRoutes);
app.use("/api/mandi-prices", marketRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/preservation-actions", preservationRoutes);
app.use("/api/trader", traderRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`CORS enabled for all origins`);
});
