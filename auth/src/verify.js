const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const jwt = require("jsonwebtoken");
const validations = require("../../helper/validations");
const createtoken = require("../../helper/jwt/create_jwt_token");
const generateOtp = require("../../helper/generateOtp");
const sentSecureCode = require("../../helper/send_email");

require("dotenv").config();
const secretKey = process.env.secretKey;

const verification = async (req, res) => {
  try {
    const { email, mobile, otp, user_id, mobileSignature } = req.body;

    let otpValue, otpGeneratedAt;
    let otpExpirationTime;
    let currentTime;
    let selectQuery = "SELECT * FROM users";
    let values = [];

    if (mobile && !otp && user_id) {
      // Validate mobile format if provided
      if (!validations.isValidMobileFormat(mobile)) {
        return res
          .status(400)
          .json({ message: "Invalid mobile number format" });
      }
      // Check if mobile exists
      selectQuery += " WHERE mobile = ? And user_id = ?";
      values = [mobile, user_id];
      const userExists = await queryAsync(selectQuery, values);

      if (userExists.length === 0) {
        return res
          .status(400)
          .json({ message: "User with this mobile number does not exist" });
      }
      otpValue = generateOtp();
      otpGeneratedAt = new Date();

      const updateQuery = `UPDATE users SET mobile_otp = ?, mobile_otp_generated_at = ? WHERE mobile = ?`;
      values = [otpValue, otpGeneratedAt, mobile];
      let Result = await queryAsync(updateQuery, values);

      if (Result.affectedRows > 0) {
        let sentResult = await sentSecureCode(
          userExists[0].email,
          otpValue,
          mobile,
          false
        );
        if (sentResult.success) {
          return res.json({ message: "OTP sent on email" });
        } else {
          return res
            .status(400)
            .json({ message: "Failed to OTP code on email" });
        }
      } else {
        return res.status(400).json({ message: "Failed to update mobile OTP" });
      }
    }

    if (otp && user_id && mobile) {
      selectQuery += ` WHERE mobile = ? AND mobile_otp = ? AND user_id = ?`;
      values = [mobile, otp, user_id];
      let otpResult = await queryAsync(selectQuery, values);

      if (otpResult.length === 0) {
        return res.status(400).json({ message: "Invalid OTP or deatails" });
      } else {
        currentTime = new Date();
        otpExpirationTime = 5 * 60 * 1000; // OTP expiration time in milliseconds (5 minutes)
        if (
          currentTime - new Date(otpResult[0].mobile_otp_generated_at) >
          otpExpirationTime
        ) {
          return res.status(400).json({ message: "Expired OTP" });
        } else {
          const updateVerificationQuery = `UPDATE users SET is_mobile_verified = 1 WHERE user_id = '${user_id}' AND mobile= '${mobile}'`;
          await queryAsync(updateVerificationQuery);

          if (otpResult[0].is_email_verified === 1) {
            let payload = {
              user_id: user_id,
              role: otpResult[0].role,
            };
            let token = createtoken(payload, secretKey);
            return res.json({
              message: `Mobile OTP verified successfully`,
              data: { token: token, user_id: user_id },
            });
          }
          return res.json({ message: `Mobile OTP verified successfully` });
        }
      }
    }

    if (email && !otp && user_id) {
      // Validate email format if provided
      if (!validations.isValidEmailFormat(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // Check if email exists
      selectQuery += " WHERE email = ? AND user_id = ?";
      values = [email, user_id];
      const userExists = await queryAsync(selectQuery, values);

      if (userExists.length === 0) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist" });
      }
      otpValue = generateOtp();
      otpGeneratedAt = new Date();

      const updateQuery = `
            UPDATE users SET email_otp = ?, email_otp_generated_at = ?
            WHERE email = ?
        `;
      values = [otpValue, otpGeneratedAt, email];
      let Result = await queryAsync(updateQuery, values);

      if (Result.affectedRows > 0) {
        let sentResult = await sentSecureCode(
          userExists[0].email,
          otpValue,
          email,
          true
        );
        if (sentResult.success) {
          return res.json({ message: "OTP sent to email", otp: otpValue });
        } else {
          return res
            .status(400)
            .json({ message: "Failed to send OTP code email" });
        }
      } else {
        return res.status(400).json({ message: "Failed to update email OTP" });
      }
    }

    if (otp && user_id && email) {
      selectQuery += ` WHERE email = ? AND email_otp = ? AND user_id = ?`;
      values = [email, otp, user_id];
      let otpResult = await queryAsync(selectQuery, values);

      if (otpResult.length === 0) {
        return res.status(400).json({ message: "Invalid OTP or details" });
      } else {
        currentTime = new Date();
        otpExpirationTime = 5 * 60 * 1000; // OTP expiration time in milliseconds (5 minutes)
        if (
          currentTime - new Date(otpResult[0].email_otp_generated_at) >
          otpExpirationTime
        ) {
          return res.status(400).json({ message: "Expired OTP" });
        } else {
          const updateVerificationQuery = `UPDATE users SET is_email_verified = 1 WHERE user_id = '${user_id}'`;
          await queryAsync(updateVerificationQuery);

          if (otpResult[0].is_mobile_verified === 1) {
            payload = {
              user_id: user_id,
              role: otpResult[0].role,
            };
            let token = createtoken(payload, secretKey);

            return res.json({
              message: `Email OTP verified successfully`,
              data: { token: token, user_id: user_id },
            });
          }
          return res.json({ message: `Email OTP verified successfully` });
        }
      }
    }
  } catch (error) {
    console.error("Error in verify:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { verification };
