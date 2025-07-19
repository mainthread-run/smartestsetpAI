
const express = require("express");
const util = require("util");
const ssmart_db = require("../../db/db_connection");

const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const submit_marks = async (req, res) => {
  try {
    const { user_id, obtained_mark, staged_type, total_mark } = req.body;

    // Validation
    if (
      user_id === undefined ||
      obtained_mark === undefined ||
      staged_type === undefined ||
      total_mark === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof obtained_mark !== "number" || typeof total_mark !== "number") {
      return res.status(400).json({ message: "obtained_mark and total_mark must be numbers" });
    }

    if (typeof staged_type !== "string" || staged_type.trim() === "") {
      return res.status(400).json({ message: "staged_type must be a non-empty string" });
    }

    if (obtained_mark > total_mark) {
      return res.status(400).json({ message: "obtained_mark cannot exceed total_mark" });
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO marks_staging (user_id, obtained_mark, staged_type, total_mark)
      VALUES (?, ?, ?, ?)
    `;
    await queryAsync(insertQuery, [user_id, obtained_mark, staged_type.trim(), total_mark]);

    return res.status(201).json({ message: "Marks submitted successfully" });

  } catch (error) {
    console.error("Error in submit_marks:", error);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { submit_marks };




/*
const express = require("express");
const util = require("util");
const ssmart_db = require("../../db/db_connection");

const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const submit_marks = async (req, res) => {
  try {
    const { obtained_mark, staged_type, total_mark } = req.body;

    // Validation
    if (
      obtained_mark === undefined ||
      staged_type === undefined ||
      total_mark === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof obtained_mark !== "number" || typeof total_mark !== "number") {
      return res
        .status(400)
        .json({ message: "obtained_mark and total_mark must be numbers" });
    }

    if (typeof staged_type !== "string" || staged_type.trim() === "") {
      return res
        .status(400)
        .json({ message: "staged_type must be a non-empty string" });
    }

    if (obtained_mark > total_mark) {
      return res
        .status(400)
        .json({ message: "obtained_mark cannot exceed total_mark" });
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO marks_staging (obtained_mark, staged_type, total_mark)
      VALUES (?, ?, ?)
    `;
    await queryAsync(insertQuery, [
      obtained_mark,
      staged_type.trim(),
      total_mark,
    ]);

    return res.status(201).json({ message: "Marks submitted successfully" });
  } catch (error) {
    console.error("Error in submit_marks:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { submit_marks };*/
