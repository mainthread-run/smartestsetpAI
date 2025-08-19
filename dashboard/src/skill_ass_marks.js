const util = require("util");
const db = require("../../db/db_connection");
const queryAsync = util.promisify(db.query).bind(db);

/**
 * POST API → Save skill assessment
 * Expects:
 * {
 *   "user_id": 101,
 *   "skills": [
 *     { "skill_name": "Communication", "score": 85 },
 *     { "skill_name": "Technical Skills", "score": 78 }
 *   ]
 * }
 */
const save_skill_assessment = async (req, res) => {
  try {
    const { user_id, skills } = req.body;

    if (!user_id || !skills || !Array.isArray(skills)) {
      return res
        .status(400)
        .json({ message: "user_id and skills[] are required" });
    }

    const insertQuery = `
      INSERT INTO skill_assessment (user_id, skill_name, score, total)
      VALUES ?
    `;

    const values = skills.map((s) => [
      user_id,
      s.skill_name,
      s.score,
      s.total || 100,
    ]);

    await queryAsync(insertQuery, [values]);

    return res.json({ message: "Skill assessment saved successfully" });
  } catch (error) {
    console.error("Error in save_skill_assessment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { save_skill_assessment };
