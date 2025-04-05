const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const path = require('path');

const app = express();

// ✅ CORS Setup
const allowedOrigins = ["https://nayvohtech.com", "https://www.nayvohtech.com"];

const corsForPost = cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
});

// ✅ Allow all origins for GET globally
app.use(cors({ methods: ["GET"] }));

// Parse JSON bodies
app.use(express.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ POST endpoint with restricted CORS
app.post("/send-email", corsForPost, async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER,
    subject: "New Contact Form Submission",
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// ✅ GET endpoint accessible from any origin
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server locally
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "vercel") {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

// ✅ For Vercel
const serverless = require("serverless-http");
module.exports = serverless(app);
