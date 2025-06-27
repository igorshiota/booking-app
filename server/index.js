const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8080;

// Log incoming requests to /images
app.use("/images", (req, res, next) => {
  console.log(`[Static] ${req.method} request for ${req.url}`);
  next();
});

// Static files middleware with error handling
app.use("/images", express.static(path.join(__dirname, "public/images"), { fallthrough: false }));

// Error handler middleware for static files
app.use((err, req, res, next) => {
  console.error("Static file serving error:", err);
  res.status(err.status || 500).send(err.message);
});

// CORS for other routes
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
});

app.use(express.json());

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "public/images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  const filePath = `/images/${req.file.filename}`;
  res.json({ url: filePath });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
