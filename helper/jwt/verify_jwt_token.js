// // Importing the required modules
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// // Fetch the secret key from environment variables
// let secretKey = process.env.secretKey;

// // Middleware function to verify JWT token
// const verifyToken = (req, res, next) => {
//   // Extract the token from the Authorization header
//   const token = req.header("Authorization").split(" ");

//   // Check if the token is present
//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized - No token provided" });
//   }

//   // Verify and decode the token using the secret key
//   jwt.verify(token[1], secretKey, (err, decoded) => {
//     // Handle errors during token verification
//     if (err) {
//       console.error("Error verifying token:", err.message);
//       return res.status(401).json({ error: "Unauthorized - Invalid token" });
//     }

//     // Attach the decoded user information to the request object
//     req.user = decoded;
//     next();
//   });
// };

// // Export the verifyToken middleware for use in other files
// module.exports = verifyToken;

const jwt = require("jsonwebtoken");
require("dotenv").config();
const util = require("util");
const indrayaniDB = require("../../db/db_connection");

const secretKey = process.env.secretKey;
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const tokenParts = authHeader.split(" ");
    const token = tokenParts[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    // Fetch user from DB to validate fcm_token
    const queryResult = await queryAsync(
      "SELECT fcm_token FROM users WHERE user_id = ?",
      [decoded.user_id]
    );

    if (queryResult[0].fcm_token !== decoded.fcm_token) {
      return res.status(401).json({
        message: "Session expired.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = verifyToken;
