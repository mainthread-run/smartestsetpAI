const util = require("util");
const db = require("../../db/db_connection");
const queryAsync = util.promisify(db.query).bind(db);

const get_total_attempts = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user's stages in order of completion
    const sql = `
      SELECT staged_type, created_at
      FROM marks_staging
      WHERE user_id = ?
      ORDER BY created_at ASC
    `;
    const rows = await queryAsync(sql, [user_id]);

    // Map sub-stages to main categories
    const stageMapping = {
      "basic interview": "basic",
      "resume analysis": "basic",
      "ai interview": "basic",

      "technical entry": "technical",
      "technical interview": "technical",
      "technical moderate": "technical",
      "technical advanced": "technical",

      "hr entry": "final",
      "hr moderate": "final",
      "hr advanced": "final",
      "final interview": "final",
    };

    let attempts = 0;
    let progress = { basic: false, technical: false, final: false };

    for (let row of rows) {
      const mainStage = stageMapping[row.staged_type];
      if (!mainStage) continue; // ignore irrelevant stages (gd, coding, etc.)

      progress[mainStage] = true;

      // Check if all 3 completed
      if (progress.basic && progress.technical && progress.final) {
        attempts++;
        progress = { basic: false, technical: false, final: false }; // reset for next attempt
      }
    }

    return res.json({ user_id, total_attempts: attempts });
  } catch (error) {
    console.error("Error in get_total_attempts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { get_total_attempts };
