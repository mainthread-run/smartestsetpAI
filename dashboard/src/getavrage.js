const express = require("express");
const util = require("util");
const ssmart_db = require("../../db/db_connection");

const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const get_avg_marks = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const sql = `
      SELECT 
        ROUND(SUM(obtained_mark), 2) AS total_obtained,
        ROUND(SUM(total_mark), 2) AS total_possible,
        ROUND((SUM(obtained_mark) / SUM(total_mark)) * 100, 2) AS percentage
      FROM marks_staging
      WHERE user_id = ?
    `;

    const result = await queryAsync(sql, [user_id]);

    if (result.length === 0 || result[0].total_obtained === null) {
      return res
        .status(404)
        .json({ message: "No marks data found for this user." });
    }

    return res.status(200).json({
      user_id: parseInt(user_id),
      total_obtained: result[0].total_obtained,
      total_possible: result[0].total_possible,
      percentage: result[0].percentage,
    });
  } catch (error) {
    console.error("Error in get_avg_marks:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { get_avg_marks };
