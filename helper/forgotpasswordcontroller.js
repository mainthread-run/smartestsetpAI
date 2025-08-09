const crypto = require("crypto");
const bcrypt = require("bcrypt");
const pingdb = require("../db_connection");
const mailSender = require("../utils/mailSender");

// POST /forgot-password
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  pingdb.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (results.length === 0) {
        return res.json({ message: "If email exists, reset link sent" }); // generic for security
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expireTime = Date.now() + 15 * 60 * 1000;

      pingdb.query(
        "UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?",
        [token, expireTime, email],
        async (err) => {
          if (err)
            return res.status(500).json({ message: "DB error", error: err });

          const resetLink = `http://localhost:3000/reset-password?token=${token}`;
          await mailSender(
            email,
            "Password Reset",
            `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
          );

          res.json({ message: "If email exists, reset link sent" });
        }
      );
    }
  );
};

// PATCH /reset-password
exports.resetPassword = (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  pingdb.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > ?",
    [token, Date.now()],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      pingdb.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE user_id = ?",
        [hashedPassword, results[0].user_id],
        (err) => {
          if (err)
            return res.status(500).json({ message: "DB error", error: err });
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
};
