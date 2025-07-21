const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { escape } = require("validator"); // sanitize user input strings

const app = express();
app.disable("x-powered-by");

const PORT = 8080;

// Static files middleware
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"), { fallthrough: false })
);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Static file serving error:", err);
  res.status(err.status || 500).send("Internal Server Error");
});

// CORS middleware (you could use the cors package more safely)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = "http://localhost:3000";
  if (origin === allowedOrigin) {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// --- Multer storage with filename sanitization ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "public/images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // sanitize filename to avoid directory traversal and ReDoS patterns
    const originalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${originalName}`);
  }
});

const upload = multer({ storage });

// --- Upload endpoint with check ---
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = `/images/${escape(req.file.filename)}`;
  res.json({ url: filePath });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
