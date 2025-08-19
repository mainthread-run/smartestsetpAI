const util = require("util");
const db = require("../../db/db_connection");
const queryAsync = util.promisify(db.query).bind(db);

/**
 * GET API → Fetch skill assessment by user_id
 * Example: GET /api/skill-assessment?user_id=101
 */
const get_skill_assessment = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const sql = `
      SELECT skill_name, ROUND(AVG(score), 2) AS percentage
      FROM skill_assessment
      WHERE user_id = ?
      GROUP BY skill_name
    `;

    const result = await queryAsync(sql, [user_id]);

    return res.json({ skills: result });
  } catch (error) {
    console.error("Error in get_skill_assessment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { get_skill_assessment };
