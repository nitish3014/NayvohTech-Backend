const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

// CORS configs
const allowedOrigins = ["https://nayvohtech.com", "https://www.nayvohtech.com"];
const allowAllCORS = cors();
const restrictPostCORS = cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
});

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", allowAllCORS, (req, res) => {
  res.send("Contact backend is running on Vercel!");
});

app.post("/send-email", restrictPostCORS, async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER,
    subject: "New Contact Form Submission",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
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

if (process.env.NODE_ENV !== "vercel") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  }
// Vercel handler export
const serverless = require("serverless-http");
module.exports = serverless(app);

