/*const file_upload = require("../../helper/file_upload"); // Your utility
const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

const upload_resume = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id || !req.files ) {
      return res
        .status(400)
        .json({ message: "User ID and resume file are required." });
    }

    const resumeFile = req.files;

    // Allow only PDF, DOC, DOCX
    const extname = resumeFile.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx"];

    if (!allowedExtensions.includes(extname)) {
      return res.status(400).json({
        message: "Invalid file type. Only PDF, DOC, or DOCX allowed.",
      });
    }

    // Upload the file to the "resumes" folder
    const result = await file_upload(resumeFile, "resumes");

    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }

    // Save file name to the DB (or update existing one)
    const updateQuery = `UPDATE users SET resume = ?, updated_at = NOW() WHERE user_id = ?`;
    await queryAsync(updateQuery, [result.filename, user_id]);

    return res.json({
      message: "Resume uploaded successfully.",
      filename: result.filename,
      resume_url: `/public/asset/resumes/${result.filename}`,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { upload_resume };
*/

const file_upload = require("../../helper/file_upload");
const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

const upload_resume = async (req, res) => {
  try {
    const { user_id } = req.body;

    // Check if user_id and file exist
    if (!user_id || !req.files || !req.files.resume) {
      return res
        .status(400)
        .json({ message: "User ID and resume file are required." });
    }

    const resumeFile = req.files.resume;

    // Allow only PDF, DOC, DOCX
    const extname = resumeFile.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx"];

    if (!allowedExtensions.includes(extname)) {
      return res.status(400).json({
        message: "Invalid file type. Only PDF, DOC, or DOCX allowed.",
      });
    }

    // Upload the file to the "resumes" folder
    const result = await file_upload(resumeFile, "resumes");

    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }

    // Save file name to the DB (or update existing one)
    const updateQuery = `UPDATE users SET resume = ?, updated_at = NOW() WHERE user_id = ?`;
    await queryAsync(updateQuery, [result.filename, user_id]);

    return res.json({
      message: "Resume uploaded successfully.",
      filename: result.filename,
      resume_url: `/public/asset/resumes/${result.filename}`,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { upload_resume };
