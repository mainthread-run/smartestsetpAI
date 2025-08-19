const util = require("util");
const db = require("../../db/db_connection");
const queryAsync = util.promisify(db.query).bind(db);

const get_total_participants = async (req, res) => {
  try {
    const sql = "SELECT COUNT(*) AS total_users FROM users";
    const result = await queryAsync(sql);

    return res.json({ total_users: result[0].total_users });
  } catch (error) {
    console.error("Error in get_total_participants:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { get_total_participants };
