const express = require("express");
const util = require("util");
const ssmart_db = require("../../db/db_connection");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const get_progress = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // 1 stage = 100 total marks (hardcoded )
    const FULL_MARKS_PER_STAGE = 100;

    const sql = `
      SELECT 
        SUM(obtained_mark) AS total_obtained,
        COUNT(*) AS total_stages
      FROM marks_staging
      WHERE user_id = ?
    `;

    const rows = await queryAsync(sql, [user_id]);
    const row = rows[0] || {};

    const total_stages = Number(row.total_stages) || 0;
    const total_obtained = Number(row.total_obtained) || 0;

  
    const total_possible = total_stages * FULL_MARKS_PER_STAGE;

    if (total_stages === 0 || total_possible === 0) {
      return res
        .status(404)
        .json({ message: "No stage data found for this user." });
    }

    const progress_percentage = Number(
      ((total_obtained / total_possible) * 100).toFixed(2)
    );

    return res.status(200).json({
      user_id: Number(user_id),
      total_obtained,
      total_possible,
      progress_percentage,
      total_stages,
    });
  } catch (error) {
    console.error("Error in get_progress:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { get_progress };
