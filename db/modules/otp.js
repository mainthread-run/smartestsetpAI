const pingdb = require("../db_connection");

// var otpTable = `
//   CREATE TABLE IF NOT EXISTS otps (
//   id int NOT NULL AUTO_INCREMENT,
//   email varchar(45) NOT NULL,
//   mobile varchar(45) NOT NULL,
//   email_otp varchar(6) NOT NULL,
//   mobile_otp varchar(6) NOT NULL,
//   email_otp_expiry timestamp NOT NULL,
//   mobile_otp_expiry timestamp NOT NULL,
//   created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   PRIMARY KEY (id),
//   UNIQUE KEY email_UNIQUE (email),
//   UNIQUE KEY mobile_UNIQUE (mobile)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
// `;

var otpTable = `
  CREATE TABLE IF NOT EXISTS otps (
  id int AUTO_INCREMENT,
  email varchar(45) DEFAULT NULL,
  mobile varchar(45) DEFAULT NULL,
  email_otp varchar(6) DEFAULT NULL,
  mobile_otp varchar(6) DEFAULT NULL,
  email_otp_expiry timestamp DEFAULT NULL,
  mobile_otp_expiry timestamp DEFAULT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email_UNIQUE (email),
  UNIQUE KEY mobile_UNIQUE (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

pingdb.query(otpTable, function (err, result) {
  if (err) 
    console.error("Error creating users table:", err);
});

module.exports = otpTable;
