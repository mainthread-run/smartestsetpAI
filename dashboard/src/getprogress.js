/*
const util = require("util");
const ssmart_db = require("../../db/db_connection");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const STAGE_MAP = {
  technical: ["technical_entry", "technical_moderate", "technical_advanced"],
  hr: ["hr_entry", "hr_moderate", "hr_advanced"],
  gd: ["gd"],
  coding: ["coding"],
  basic_interview: ["basic_interview"],
  resume_analysis: ["resume_analysis"],
  ai_interview: ["ai_interview"],
};

const weights = {
  technical: 0.25,
  hr: 0.25,
  gd: 0.1,
  coding: 0.15,
  basic_interview: 0.05,
  resume_analysis: 0.1,
  ai_interview: 0.1,
};

const get_all_progress = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const sql = `
      SELECT staged_type, obtained_mark, total_mark
      FROM marks_staging
      WHERE user_id = ?
    `;

    const rows = await queryAsync(sql, [user_id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No progress data found." });
    }

    const stageScores = {};
    let finalScore = 0;

    for (const [stage, subtypes] of Object.entries(STAGE_MAP)) {
      const filtered = rows.filter((r) => subtypes.includes(r.staged_type));

      const obtained = filtered.reduce(
        (sum, row) => sum + (row.obtained_mark || 0),
        0
      );
      const total = filtered.reduce(
        (sum, row) => sum + (row.total_mark || 0),
        0
      );
      const score = total > 0 ? (obtained / total) * 100 : 0;

      stageScores[stage] = {
        obtained,
        total,
        score: Math.round(score),
      };

      finalScore += (score / 100) * weights[stage];
    }

    return res.status(200).json({
      user_id: parseInt(user_id),
      progress_percentage: +(finalScore * 100).toFixed(2),
      stage_details: stageScores,
    });
  } catch (error) {
    console.error("Error in get_all_progress:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { get_all_progress };
*/


const util = require("util");
const ssmart_db = require("../../db/db_connection");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

// Map raw staged_type from DB to our standard categories
const stageTypeMapping = {
  "technical entry": "technical",
  "technical interview": "technical",
  "technical moderate": "technical",
  "technical advanced": "technical",

  "hr entry": "hr",
  "hr moderate": "hr",
  "hr advanced": "hr",
  "final interview": "hr",

   "gd": "gd",
  "group discussion": "gd",

  "coding": "coding",
  "coding stage": "coding",

  "basic interview": "basic_interview",
  "resume analysis": "resume_analysis",
  "ai interview": "ai_interview",
};

// Define weight for each main stage
const weights = {
  technical: 0.25,
  hr: 0.25,
  gd: 0.1,
  coding: 0.15,
  basic_interview: 0.05,
  resume_analysis: 0.1,
  ai_interview: 0.1,
};

const get_all_progress = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const sql = `
      SELECT staged_type, obtained_mark, total_mark
      FROM marks_staging
      WHERE user_id = ?
    `;
    const rows = await queryAsync(sql, [user_id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No progress data found." });
    }

    const stageScores = {};
    let finalScore = 0;

    // Initialize scores
    for (const stage in weights) {
      stageScores[stage] = {
        obtained: 0,
        total: 0,
        score: 0,
      };
    }

    // Aggregate scores per mapped stage
    for (const row of rows) {
      const rawType = row.staged_type.toLowerCase();
      const mappedStage = stageTypeMapping[rawType];

      if (!mappedStage) continue; // Skip unmapped stages

      stageScores[mappedStage].obtained += Number(row.obtained_mark || 0);
      stageScores[mappedStage].total += Number(row.total_mark || 0);
    }

    // Compute score percentage and weighted score
    for (const stage in stageScores) {
      const { obtained, total } = stageScores[stage];
      const score = total > 0 ? (obtained / total) * 100 : 0;
      stageScores[stage].score = Math.round(score);
      finalScore += (score / 100) * weights[stage];
    }

    return res.status(200).json({
      user_id: parseInt(user_id),
      progress_percentage: +(finalScore * 100).toFixed(2),
      stage_details: stageScores,
    });
  } catch (error) {
    console.error("Error in get_all_progress:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { get_all_progress };

