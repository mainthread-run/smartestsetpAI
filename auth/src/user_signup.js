const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const validations = require("../../helper/validations")

const user_signup = async (req, res) => {
    try {

        const { mobile, email, first_name, last_name, education, city, district, state, pin_code, fcm_token, google_id } = req.body;
        if ((!mobile || !email || !first_name || !last_name || !education || !city || !district || !state || !pin_code || !fcm_token))
            return res.status(400).json({ message: 'Please provide all required details' });

        // Validate mobile format if provided
        if (mobile && !validations.isValidMobileFormat(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number format' });
        }

        // Validate email format if provided
        if (email && !validations.isValidEmailFormat(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        let selectQuery = `SELECT * FROM users WHERE mobile = '${mobile}' OR email = '${email}'`;
        const userExists = await queryAsync(selectQuery);

        if (userExists.length > 0) {
            return res.status(400).json({
                data:{message: 'User already exists',
                    is_mobile_verified: userExists[0].is_mobile_verified,
                    is_email_verified: userExists[0].is_email_verified,
                    user_id: userExists[0].user_id}
            }
        );}
        
        const g_id = google_id ? google_id : null;
        const email_verified = google_id ? 1 : 0;
        
        // Insert new user into the database
        const insertValues = [mobile, email, first_name, last_name, education, city, district, state, pin_code, fcm_token, g_id, email_verified];
        const insertUserQuery = `
            INSERT INTO users (mobile, email, first_name, last_name, education, city, district, state, pin_code,fcm_token, created_at, google_id, is_email_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `;
        const insertResult = await queryAsync(insertUserQuery, insertValues);
        return res.json({data:{user_id: insertResult.insertId} , message: 'User created successfully. Please verify your mobile number and email to activate your account.' });

    } catch (error) {
        console.error('Error in user_signup:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { user_signup };
