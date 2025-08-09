const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const validations = require("../../helper/validations");

const user_update = async (req, res) => {
  try {
    const {
      user_id,
      mobile,
      email,
      first_name,
      last_name,
      education,
      city,
      district,
      state,
      pin_code,
      fcm_token,
    } = req.body;

    // Validate required fields
    if (!user_id) {
      return res
        .status(400)
        .json({ message: "User ID is required for update." });
    }

    // Optional validations
    if (mobile && !validations.isValidMobileFormat(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    if (email && !validations.isValidEmailFormat(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user exists
    const checkQuery = `SELECT * FROM users WHERE user_id = ?`;
    const userResult = await queryAsync(checkQuery, [user_id]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    const updateQuery = `
            UPDATE users 
            SET 
                mobile = ?, 
                email = ?, 
                first_name = ?, 
                last_name = ?, 
                education = ?, 
                city = ?, 
                district = ?, 
                state = ?, 
                pin_code = ?, 
                fcm_token = ?, 
                updated_at = NOW()
            WHERE user_id = ?
        `;

    const updateValues = [
      mobile || userResult[0].mobile,
      email || userResult[0].email,
      first_name || userResult[0].first_name,
      last_name || userResult[0].last_name,
      education || userResult[0].education,
      city || userResult[0].city,
      district || userResult[0].district,
      state || userResult[0].state,
      pin_code || userResult[0].pin_code,
      fcm_token || userResult[0].fcm_token,
      user_id,
    ];

    await queryAsync(updateQuery, updateValues);

    return res.json({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error in user_update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { user_update };
