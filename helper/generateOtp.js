const generateOtp = () => {
  // return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  const randomOTP = Math.floor(1000 + Math.random() * 9000);

  return randomOTP;
};

module.exports = generateOtp;
