const util = require("util");
const jwt = require("jsonwebtoken");
const indrayniDB = require("../../db/db_connection");

const user_logout = async (req, res) => {
  try {
    let user_id = req.user.user_id;
    if (!user_id) {
      res.status(400).json({
        message: "Please provide valid user id",
      });
    }

    let token = req.header("Authorization").split(" ");
    if (!token) {
      res.status(400).json({
        message: "Please provide valid token",
      });
    }

    let payload = {
      user_id: user_id,
      token: token[1],
    };
    const exptoken = jwt.sign(payload, process.env.secretKey, {
      expiresIn: "1s",
    });
    if (exptoken) {
      return res.cookie("token", null).json({
        message: "Logout successfully",
      });
    } else {
      return res.status(500).json({
        message: "Unable to logout, please try again",
      });
    }
  } catch (error) {
    console.log("Error in logout API: ", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = { user_logout };
