const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const validations = require("../../helper/validations");

const verifyOtp = async (req, res) => {
    try {
        const { email, mobile, otp, user_id } = req.body;
        const otpExpirationTime = 2 * 60 * 1000; // OTP expiration time in milliseconds (2 minutes)
        const currentTime = new Date();
        let values = [];

        if ((!otp && !user_id) && (!mobile || !email)) {
            return res.status(400).json({ message: 'Provide required inputs' });
        }

        // Validate mobile format if provided
        if (mobile && !validations.isValidMobileFormat(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number format' });
        }

        // Validate email format if provided
        if (email && !validations.isValidEmailFormat(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }


        const field = mobile ? 'mobile' : 'email';
        const otpField = mobile ? 'mobile_otp' : 'email_otp';
        const otpGeneratedAtField = mobile ? 'mobile_otp_generated_at' : 'email_otp_generated_at';
        const isVerifiedField = mobile ? 'is_mobile_verified' : 'is_email_verified';

        const otpQuery = `SELECT * FROM users WHERE ${field} = ? AND ${otpField} = ? AND user_id = ${user_id}`;
        values = [(mobile || email), otp];
        const otpResult = await queryAsync(otpQuery, values);
        if (otpResult.length === 0) {
            return res.status(400).json({ message: 'Invalid inputs' });
        }

        if (currentTime - new Date(otpResult[0][otpGeneratedAtField]) > otpExpirationTime) {
            return res.status(400).json({ message: 'Expired OTP' });
        }

        const updateVerificationQuery = `UPDATE users SET ${isVerifiedField} = 1 WHERE user_id = ${user_id}`;
        await queryAsync(updateVerificationQuery);

        res.status(200).json({ message: `${mobile ? 'Mobile' : 'Email'} OTP verified successfully` });

    } catch (error) {
        console.error("Error in verify OTP:", error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


module.exports = { verifyOtp };
