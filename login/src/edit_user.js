// const util = require("util");
// const ssmart_db = require("../../db/db_connection");
// const bcrypt = require("bcrypt");
// const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);
// const validations = require("../../helper/validations");

// const edit_user = async (req, res) => {
//   try {
//     const { user_id } = req.params;
//     const {
//       first_name,
//       last_name,
//       email,
//       mobile,
//       password,
//       address,
//       nation,
//       dob,
//     } = req.body;

//     // Check if user exists
//     const selectQuery = "SELECT * FROM users WHERE user_id = ?";
//     const existingUser = await queryAsync(selectQuery, [user_id]);

//     if (existingUser.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const updates = [];
//     const values = [];

//     // Optional updates (only update if value is provided)
//     if (first_name) {
//       updates.push("first_name = ?");
//       values.push(first_name);
//     }

//     if (last_name) {
//       updates.push("last_name = ?");
//       values.push(last_name);
//     }

//     if (email) {
//       if (!validations.isValidEmailFormat(email)) {
//         return res.status(400).json({ message: "Invalid email format" });
//       }
//       updates.push("email = ?");
//       values.push(email);
//     }

//     if (mobile) {
//       if (!validations.isValidMobileFormat(mobile)) {
//         return res.status(400).json({ message: "Invalid mobile number format" });
//       }
//       updates.push("mobile = ?");
//       values.push(mobile);
//     }

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       updates.push("password = ?");
//       values.push(hashedPassword);
//     }

//     if (address) {
//       updates.push("address = ?");
//       values.push(address);
//     }

//     if (nation) {
//       updates.push("nation = ?");
//       values.push(nation);
//     }

//     if (dob) {
//       updates.push("dob = ?");
//       values.push(dob);
//     }

//     if (updates.length === 0) {
//       return res.status(400).json({ message: "No fields provided to update" });
//     }

//     const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
//     values.push(user_id); // Add id at the end for the WHERE clause

//     await queryAsync(updateQuery, values);

//     return res.status(200).json({ message: "User updated successfully" });
//   } catch (error) {
//     console.error("Error in edit_user:", error);
//     return res.status(500).json({ message: "Something went wrong, please try again" });
//   }
// };

// module.exports = { edit_user };











const util = require("util");
const ssmart_db = require("../../db/db_connection");
const bcrypt = require("bcrypt");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);
const validations = require("../../helper/validations");

const edit_user = async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      first_name,
      last_name,
      email,
      mobile,
      password,
      address,
      nation,
      dob,
      role,
      skills,
      education,
      experience,
      projects,
    } = req.body;

    // Check if user exists
    const selectQuery = "SELECT * FROM users WHERE user_id = ?";
    const existingUser = await queryAsync(selectQuery, [user_id]);

    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = [];
    const values = [];

    // Optional updates (only update if value is provided)
    if (first_name) {
      updates.push("first_name = ?");
      values.push(first_name);
    }

    if (last_name) {
      updates.push("last_name = ?");
      values.push(last_name);
    }

    if (email) {
      if (!validations.isValidEmailFormat(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      updates.push("email = ?");
      values.push(email);
    }

    if (mobile) {
      if (!validations.isValidMobileFormat(mobile)) {
        return res.status(400).json({ message: "Invalid mobile number format" });
      }
      updates.push("mobile = ?");
      values.push(mobile);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (address) {
      updates.push("address = ?");
      values.push(address);
    }

    if (nation) {
      updates.push("nation = ?");
      values.push(nation);
    }

    if (dob) {
      updates.push("dob = ?");
      values.push(dob);
    }

    if (role) {
      updates.push("role = ?");
      values.push(role);
    }

    if (skills) {
      updates.push("skills = ?");
      values.push(skills);
    }

    if (education) {
      updates.push("education = ?");
      values.push(education);
    }

    if (experience) {
      updates.push("experience = ?");
      values.push(experience);
    }

    if (projects) {
      updates.push("projects = ?");
      values.push(projects);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
    values.push(user_id); // Add id at the end for the WHERE clause

    await queryAsync(updateQuery, values);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error in edit_user:", error);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { edit_user };

