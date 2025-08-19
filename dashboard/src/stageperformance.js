const express = require("express");
const util = require("util");
const ssmart_db = require("../../db/db_connection");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const stageTypeMapping = {
  "technical entry": "Technical Interview",
  "technical interview": "Technical Interview",
  "technical moderate": "Technical Interview",
  "technical advanced": "Technical Interview",

  "hr entry": "Final Interview",
  "hr moderate": "Final Interview",
  "hr advanced": "Final Interview",
  "final interview": "Final Interview",

  "gd": "Group Discussion",
  "group discussion": "Group Discussion",

  "coding": "Coding Test",
  "coding stage": "Coding Test",

  "basic interview": "Basic Interview",
  "resume analysis": "Resume Analysis",
  "ai interview": "AI Interview",
};

// This is the fixed order you want in the output
const stageOrder = [
  "Basic Interview",
  "Coding Test",
  "Technical Interview",
  "Group Discussion",
  "Final Interview",
];

const get_stage_performance = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const sql = `
      SELECT staged_type, obtained_mark
      FROM marks_staging
      WHERE user_id = ?
    `;

    const rows = await queryAsync(sql, [user_id]);

    // Group by unified stage name
    const stageData = {};
    for (const row of rows) {
      const stageName = stageTypeMapping[row.staged_type] || row.staged_type;
      if (!stageData[stageName]) {
        stageData[stageName] = { attempts: 0, highest_score: 0 };
      }
      stageData[stageName].attempts += 1;
      if (row.obtained_mark > stageData[stageName].highest_score) {
        stageData[stageName].highest_score = row.obtained_mark;
      }
    }

    // Build output list in fixed order
    const response = stageOrder.map((stage, index) => {
      const data = stageData[stage] || { attempts: 0, highest_score: null };
      let status = "LOCKED";
      if (data.attempts > 0) {
        status = data.highest_score >= 80 ? "PASSED" : "AVAILABLE"; // 50% pass mark
      } else if (
        index === 0 ||
        (response && response[index - 1]?.status === "PASSED")
      ) {
        status = "AVAILABLE";
      }
      return {
        stage,
        attempts: data.attempts,
        highest_score: data.highest_score,
        status,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in get_stage_performance:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { get_stage_performance };
