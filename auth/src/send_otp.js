const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const generateOtp = require("../../helper/generateOtp");
const validations = require("../../helper/validations");

const sendOtp = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile && !email) {
      return res
        .status(400)
        .json({ message: "Provide either mobile or email" });
    }

    let otpValue, otpGeneratedAt;
    let selectQuery = "SELECT * FROM users";
    let values = [];

    if (mobile) {
      // Validate mobile format if provided
      if (!validations.isValidMobileFormat(mobile)) {
        return res
          .status(400)
          .json({ message: "Invalid mobile number format" });
      }
      // Check if mobile exists
      selectQuery += " WHERE mobile = ?";
      values = [mobile];
      const userExists = await queryAsync(selectQuery, values);

      if (userExists.length === 0) {
        return res
          .status(400)
          .json({ message: "User with this mobile number does not exist" });
      }

      otpValue = generateOtp.generateOtp();
      otpGeneratedAt = new Date();

      const updateQuery = `UPDATE users SET mobile_otp = ?, mobile_otp_generated_at = ? WHERE mobile = ?`;
      values = [otpValue, otpGeneratedAt, mobile];
      await queryAsync(updateQuery, values);

      return res
        .status(200)
        .json({ message: "OTP sent to mobile", otp: otpValue });
    } else if (email) {
      // Validate email format if provided
      if (!validations.isValidEmailFormat(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // Check if email exists
      selectQuery += " WHERE email = ?";
      values = [email];
      const userExists = await queryAsync(selectQuery, values);

      if (userExists.length === 0) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist" });
      }
      otpValue = generateOtp.generateOtp();
      otpGeneratedAt = new Date();

      const updateQuery = `
                UPDATE users SET email_otp = ?, email_otp_generated_at = ?
                WHERE email = ?
            `;
      values = [otpValue, otpGeneratedAt, email];
      await queryAsync(updateQuery, values);

      return res
        .status(200)
        .json({ message: "OTP sent to email", otp: otpValue });
    }
  } catch (error) {
    console.error("Error in sending OTP:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again" });
  }
};
module.exports = { sendOtp };
