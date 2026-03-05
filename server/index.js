// Force Google DNS to fix ISP/network blocks on MongoDB Atlas SRV lookups
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { seedAdmin } = require("./models/User");

const authRoutes = require("./routes/auth");
const billRoutes = require("./routes/bills");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://mst-gold.onrender.com"],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
console.log(MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log(err);
    process.exit(1);
  });
