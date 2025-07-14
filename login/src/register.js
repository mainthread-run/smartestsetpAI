const util = require("util");
const ssmart_db = require("../../db/db_connection");
const bcrypt = require("bcrypt");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);
const validations = require("../../helper/validations");

const register_user = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      mobile,
      password,
      address,
      nation,
      dob,
      role ,
      skills = null,
      education = null,
      experience = null,
      projects = null,
    } = req.body;

    if (!first_name || !last_name || !email || !mobile || !password || !address || !nation || !dob) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (!validations.isValidEmailFormat(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validations.isValidMobileFormat(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    if (!validations.isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character"
      });
    }

    const selectQuery = "SELECT * FROM users WHERE email = ? OR mobile = ?";
    const existingUser = await queryAsync(selectQuery, [email, mobile]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User with this email or mobile already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users 
      (first_name, last_name, email, mobile, password, address, nation, dob, role, skills, education, experience, projects)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [
      first_name,
      last_name,
      email,
      mobile,
      hashedPassword,
      address,
      nation,
      dob,
      role,
      skills,
      education,
      experience,
      projects
    ];
    await queryAsync(insertQuery, insertValues);

    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Error in register_user:", error);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { register_user };
