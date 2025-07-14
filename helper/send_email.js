const nodemailer = require("nodemailer");
require("dotenv").config();

let email = process.env.email;
let password = process.env.password;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // secure for 465, false for other
  auth: {
    user: email,
    pass: password,
  },
});

const sentSecureCode = async (receiver, code, contactInfo, isEmail) => {
  try {
    const message = isEmail
      ? `Hello..Please note ${code} is your secure code for your registered email address ${contactInfo}.`
      : `Hello..Please note ${code} is your secure code for your registered mobile number ${contactInfo}.`;

    const info = await transporter.sendMail({
      from: email,
      to: receiver,
      subject: "Secure Code",
      text: message,
    });
    return {
      success: true,
      message: "Secure code email has been sent.",
    };
  } catch (error) {
    console.error("Error sending email:", error);

    return {
      success: false,
      message: "Failed to send secure code email. Please try again later.",
    };
  }
};

module.exports = sentSecureCode;
