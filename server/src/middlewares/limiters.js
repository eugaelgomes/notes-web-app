const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // max of 5 login attempts per IP
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.username || req.ip, // Block by user AND IP
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many attempts. Please wait 15 minutes." });
  },
  skipSuccessfulRequests: true, // Reset on successful login
});

module.exports = { loginLimiter };
