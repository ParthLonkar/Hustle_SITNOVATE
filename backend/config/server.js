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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Agrichain API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/crops", cropsRoutes);
app.use("/api/mandi-prices", marketRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/preservation-actions", preservationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
