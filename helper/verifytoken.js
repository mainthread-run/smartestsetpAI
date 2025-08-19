const util = require("util");
const pingdb = require("../db/db_connection");

const queryAsync = util.promisify(pingdb.query).bind(pingdb);

const verify_token = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const [user] = await queryAsync(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > ?",
      [token, Date.now()]
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    return res.json({ message: "Token valid", email: user.email });
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { verify_token };
