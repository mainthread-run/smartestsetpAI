const util = require("util");
const ssmart_db = require("../../db/db_connection");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);

const submit_support_request = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;

    // Basic validation
    if (!subject || !category || !priority || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Priority check
    const allowedPriorities = ["Low", "Medium", "High"];
    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    // Insert into DB
    const sql = `
      INSERT INTO support_requests (subject, category, priority, message, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await queryAsync(sql, [
      subject.trim(),
      category.trim(),
      priority,
      message.trim(),
    ]);

    return res
      .status(201)
      .json({ message: "Support request submitted successfully" });
  } catch (error) {
    console.error("Error in submit_support_request:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { submit_support_request };
