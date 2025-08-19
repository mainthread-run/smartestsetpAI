const bcrypt = require("bcrypt");
const util = require("util");
const pingdb = require("../db/db_connection");

const queryAsync = util.promisify(pingdb.query).bind(pingdb);

const reset_password = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const [user] = await queryAsync(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > ?",
      [token, Date.now()]
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await queryAsync(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE user_id = ?",
      [hashedPassword, user.user_id]
    );

    return res.json({
      message: "Password updated successfully. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { reset_password };
