const express = require("express");
const util = require("util");
const ssmart_db = require("../../db/db_connection");

const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const get_stage_marks = async (req, res) => {
  try {
    const { user_id, staged_type } = req.query;

    // Validate
    if (!user_id || !staged_type) {
      return res
        .status(400)
        .json({ message: "user_id and staged_type are required" });
    }

    const query = `
      SELECT staged_type, obtained_mark, total_mark
      FROM marks_staging
      WHERE user_id = ? AND staged_type = ?
    `;

    const result = await queryAsync(query, [user_id, staged_type]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No marks found for the given user and stage type" });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error in get_stage_marks:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { get_stage_marks };
