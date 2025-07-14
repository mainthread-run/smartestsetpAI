const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const generateOtp = require("../../helper/generateOtp");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const validations = require("../../helper/validations");
require("dotenv").config();
const secretKey = process.env.secretKey;
const createToken = require("../../helper/jwt/create_jwt_token");
const sentSecureCode = require("../../helper/send_email");

const updateFcmToken = async (fcm_token, email) => {
  const values = [fcm_token, email];
  await queryAsync("UPDATE users SET fcm_token = ? WHERE email = ?", values);
};

const handleSignInResponse = (user, token, res) => {
  return res.json({
    message: "Sign in successful",
    data: {
      token: token,
      user_id: user.user_id,
      role: user.role,
    },
  });
};

const user_login = async (req, res) => {
  try {
    const { mobile, otp, fcm_token, google_id, email } = req.body;

    if (!fcm_token) {
      return res.status(403).json({ message: "Please provide fcm_token" });
    }

    let selectQuery = "SELECT * FROM users";
    let values = [];

    // Handle user login via Google
    if (google_id && email) {
      selectQuery += ` WHERE email = '${email}'`;
      const queryResult = await queryAsync(selectQuery);

      if (queryResult.length === 0) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist" });
      }

      const user = queryResult[0];

      if (fcm_token !== user.fcm_token) {
        await updateFcmToken(fcm_token, email);
      }

      const payload = {
        user_id: user.user_id,
        role: user.role,
        fcm_token: fcm_token,
      };

      let token = createToken(payload, secretKey);

      if (user.google_id === google_id) {
        return handleSignInResponse(user, token, res);
      }

      // Update google_id if mismatch
      const updateResult = await queryAsync(
        "UPDATE users SET google_id = ? WHERE email = ?",
        [google_id, email]
      );

      if (updateResult.affectedRows > 0) {
        return handleSignInResponse(user, token, res);
      } else {
        return res
          .status(400)
          .json({ message: "Failed to update user google id" });
      }
    }

    // Handle static users (special case for 8888888888 or 9999999999)
    if (mobile == 8888888888 || mobile == 9999999999) {
      if (!otp) {
        return res.status(200).json({ message: "Please provide mobile otp" });
      }

      selectQuery += ` WHERE mobile = '${mobile}' AND mobile_otp = ${otp}`;
      const finduserresult = await queryAsync(selectQuery);

      if (finduserresult.length > 0) {
        const user = finduserresult[0];

        if (user.is_mobile_verify == 0 && user.is_email_verify == 0) {
          return res.status(400).json({
            message:
              "Please verify your mobile number and email to activate your account.",
            data: { user_id: user.user_id },
          });
        }

        if (fcm_token !== user.fcm_token) {
          await updateFcmToken(fcm_token, user.email);
        }

        const payload = {
          user_id: user.user_id,
          role: user.role,
          fcm_token: fcm_token,
        };

        const token = createToken(payload, secretKey);
        user.token = token;

        return handleSignInResponse(user, token, res);
      } else {
        return res
          .status(404)
          .json({ message: "Please provide correct mobile otp." });
      }
    }

    // Handle regular user login via mobile
    selectQuery += ` WHERE mobile = '${mobile}'`;
    const checkverification = await queryAsync(selectQuery);

    if (checkverification.length === 0) {
      return res.status(400).json({
        message:
          "User with this mobile number does not exist or invalid mobile number",
      });
    }

    const user = checkverification[0];

    if (user.is_email_verified != 1 || user.is_mobile_verified != 1) {
      return res.status(400).json({
        message:
          "Please verify your mobile number and email to activate your account.",
      });
    }

    if (mobile && !otp) {
      const mobileOtp = generateOtp();
      const mobile_otp_generated_at = new Date();

      const updateQuery =
        "UPDATE users SET mobile_otp = ?, fcm_token = ?, mobile_otp_generated_at = ? WHERE mobile = ?";
      const values = [mobileOtp, fcm_token, mobile_otp_generated_at, mobile];
      const updateResult = await queryAsync(updateQuery, values);

      if (updateResult.affectedRows > 0) {
        let sentResult = await sentSecureCode(
          user.email,
          mobileOtp,
          mobile,
          false
        );
        if (sentResult.success) {
          return res.json({ message: "OTP sent on your registered email" });
        } else {
          return res
            .status(400)
            .json({ message: "Failed to send OTP code on email" });
        }
      } else {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    }

    // Validate OTP
    if (mobile && otp) {
      selectQuery += ` AND mobile_otp = ? AND fcm_token = ?`;
      const values = [otp, fcm_token];
      const otpResult = await queryAsync(selectQuery, values);

      if (otpResult.length === 0) {
        return res.status(400).json({ message: "Invalid OTP or details" });
      }

      const otp_generated_at = new Date(otpResult[0].mobile_otp_generated_at);
      const currentTime = new Date();

      if (currentTime - otp_generated_at > 2 * 60 * 1000) {
        return res.status(400).json({ message: "Expired OTP" });
      }

      const payload = {
        user_id: otpResult[0].user_id,
        role: otpResult[0].role,
        fcm_token: fcm_token,
      };

      const token = createToken(payload, secretKey);
      return handleSignInResponse(otpResult[0], token, res);
    }
  } catch (error) {
    console.error("Error in user_login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { user_login };
