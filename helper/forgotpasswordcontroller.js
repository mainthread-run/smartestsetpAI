const crypto = require("crypto");
const util = require("util");
const pingdb = require("../db/db_connection");
const send_email = require("../helper/send_email");

const queryAsync = util.promisify(pingdb.query).bind(pingdb);

const forgot_password = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const [user] = await queryAsync("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user) {
      // Always send same response for security
      return res.json({ message: "If email exists, reset link sent" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = Date.now() + 15 * 60 * 1000; // 15 min

    // Save token in DB
    await queryAsync(
      "UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?",
      [token, expireTime, email]
    );

    // Send reset link
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await send_email(
      email,
      "Password Reset",
      `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 15 minutes.</p>`
    );

    return res.json({ message: "If email exists, reset link sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { forgot_password };
