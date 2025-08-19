const util = require("util");
const db = require("../../db/db_connection");
const queryAsync = util.promisify(db.query).bind(db);

// Stage mapping: map sub-stages to their main stage
const STAGE_MAP = {
  "technical entry": "technical interview",
  "technical interview": "technical interview",
  "technical moderate": "technical interview",
  "technical advanced": "technical interview",

  "hr entry": "final interview",
  "hr moderate": "final interview",
  "hr advanced": "final interview",
  "final interview": "final interview",

  "basic interview": "basic interview",
  "resume analysis": "basic interview", // optional
  "ai interview": "basic interview", // optional
};

// Required stages for a complete attempt
const REQUIRED_STAGES = [
  "basic interview",
  "technical interview",
  "final interview",
];
const PASS_MARK_PERCENTAGE = 60; // threshold for pass

const get_success_rate = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch all marks for the user
    const sql = `
      SELECT staged_type, obtained_mark, total_mark, created_at
      FROM marks_staging
      WHERE user_id = ?
      ORDER BY created_at ASC
    `;
    const rows = await queryAsync(sql, [user_id]);

    if (!rows.length) {
      return res.json({
        user_id,
        total_attempts: 0,
        successful_attempts: 0,
        success_rate: "0%",
      });
    }

    let attempts = [];
    let currentAttempt = {};

    for (let row of rows) {
      const rawStage = row.staged_type.toLowerCase();
      const stage = STAGE_MAP[rawStage]; // normalize stage

      if (stage && REQUIRED_STAGES.includes(stage)) {
        currentAttempt[stage] = (row.obtained_mark / row.total_mark) * 100;
      }

      // If all required stages are present → one attempt completed
      if (REQUIRED_STAGES.every((s) => currentAttempt[s] !== undefined)) {
        attempts.push({ ...currentAttempt });
        currentAttempt = {};
      }
    }

    let totalAttempts = attempts.length;
    let successfulAttempts = attempts.filter((attempt) =>
      REQUIRED_STAGES.every((stage) => attempt[stage] >= PASS_MARK_PERCENTAGE)
    ).length;

    let successRate =
      totalAttempts > 0
        ? ((successfulAttempts / totalAttempts) * 100).toFixed(2) + "%"
        : "0%";

    return res.json({
      user_id,
      total_attempts: totalAttempts,
      successful_attempts: successfulAttempts,
      success_rate: successRate,
      attempts,
    });
  } catch (error) {
    console.error("Error in get_success_rate:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { get_success_rate };
