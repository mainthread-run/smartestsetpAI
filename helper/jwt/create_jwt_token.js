// Importing the required module
const jwt = require("jsonwebtoken");

// Function to create a JWT token
const createtoken = (payload, secretKey) => {
  // Sign the payload with the secret key to create a token
  let token_data = jwt.sign(payload, secretKey);

  // Return the generated token
  return token_data;
};

// Export the createtoken function for use in other files
module.exports = createtoken;
