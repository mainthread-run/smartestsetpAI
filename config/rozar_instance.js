const Rozorpay = require("razorpay");
require("dotenv").config();

let rozorpay = new Rozorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

module.exports = rozorpay;
