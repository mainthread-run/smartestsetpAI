// const util = require("util");
// const ssmart_db = require("../../db/db_connection");
// const bcrypt = require("bcrypt"); // Assuming bcrypt is used for password hashing
// const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);
// const createToken = require("../../helper/jwt/create_jwt_token"); // Assuming you have a helper to generate JWT token
// const validations = require("../../helper/validations");


// const login_user = async (req, res) => {
//   try {
//     const { mobile, email, password } = req.body;

//     if (!mobile && !email) {
//       return res
//         .status(400)
//         .json({ message: "Provide either mobile or email" });
//     }

//     let selectQuery = "SELECT * FROM users";
//     let values = [];
//     let user = null;

//     if (mobile) {
//       // Validate mobile format if provided
//       if (!validations.isValidMobileFormat(mobile)) {
//         return res.status(400).json({ message: "Invalid mobile number format" });
//       }
      
//       // Check if mobile exists
//       selectQuery += " WHERE mobile = ?";
//       values = [mobile];
//       const userExists = await queryAsync(selectQuery, values);
      
//       if (userExists.length === 0) {
//         return res.status(400).json({ message: "User with this mobile number does not exist" });
//       }
//       user = userExists[0]; // Assuming the first match is the user
//     } else if (email) {
//       // Validate email format if provided
//       if (!validations.isValidEmailFormat(email)) {
//         return res.status(400).json({ message: "Invalid email format" });
//       }
      
//       // Check if email exists
//       selectQuery += " WHERE email = ?";
//       values = [email];
//       const userExists = await queryAsync(selectQuery, values);
      
//       if (userExists.length === 0) {
//         return res.status(400).json({ message: "User with this email does not exist" });
//       }
//       user = userExists[0]; // Assuming the first match is the user
//     }

//     // Check if password matches the stored password (hashed)
//     const isPasswordValid = await bcrypt.compare(password, user.password); // Assuming user.password is hashed

//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     // Create token (if using JWT)
//     const payload = {
//       user_id: user.user_id,
//       role: user.role,
//     };
//     const token = createToken(payload, process.env.secretKey); // Assuming you have a secret key in env

//     // Return success response with the token and user details
//     // return res.status(200).json({
//     //   message: "Login successful",
//     //   data: {
//     //     token: token,
//     //     user_id: user.user_id,
//     //     role: user.role,
//     //     email: user.email,
//     //     mobile: user.mobile,
//     //   },
//     // });


//     return res.status(200).json({
//   message: "Login successful",
//   data: {
//     token: token,
//     user_id: user.user_id,
//     role: user.role,
//     email: user.email,
//     mobile: user.mobile,
//   },
// });


//   } catch (error) {
//     console.error("Error in login_user:", error);
//     return res.status(500).json({ message: "Something went wrong, please try again" });
//   }
// };

// module.exports = { login_user };
















const util = require("util");
const ssmart_db = require("../../db/db_connection");
const bcrypt = require("bcrypt");
const queryAsync = util.promisify(ssmart_db.query).bind(ssmart_db);
const createToken = require("../../helper/jwt/create_jwt_token");
const validations = require("../../helper/validations");

const login_user = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate email format
    if (!validations.isValidEmailFormat(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Fetch user by email
    const selectQuery = "SELECT * FROM users WHERE email = ?";
    const userExists = await queryAsync(selectQuery, [email]);

    if (userExists.length === 0) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    const user = userExists[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Create JWT token
    const payload = {
      user_id: user.user_id,
      role: user.role,
    };
    const token = createToken(payload, process.env.secretKey);

    // Respond with success and token
    return res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user_id: user.user_id,
        role: user.role,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Error in login_user:", error);
    return res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = { login_user };

