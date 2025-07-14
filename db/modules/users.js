const pingdb = require("../db_connection");

var usersTable = `
    CREATE TABLE IF NOT EXISTS users (
    user_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    mobile varchar(45)DEFAULT NULL,
    email varchar(45) DEFAULT NULL,
    first_name varchar(45) DEFAULT NULL,
    last_name varchar(45) DEFAULT NULL,
    education varchar(45) DEFAULT NULL,
    opted_interview tinyint DEFAULT '0',
    password varchar(90) DEFAULT NULL,
    city varchar(45) DEFAULT NULL,
    district varchar(45)DEFAULT NULL,
    state varchar (45)DEFAULT NULL,
    pin_code int DEFAULT NULL,
    address varchar(45) DEFAULT NULL,
    role VARCHAR(45) NOT NULL DEFAULT "User",
    is_active tinyint DEFAULT '0',
    is_deleted tinyint DEFAULT '0',
    is_mobile_verified tinyint DEFAULT '0',
    is_email_verified tinyint DEFAULT '0',
    email_otp varchar(6) DEFAULT NULL,
    mobile_otp varchar(6) DEFAULT NULL,
    email_otp_generated_at DATETIME DEFAULT NULL,
    mobile_otp_generated_at DATETIME DEFAULT NULL,
    fcm_token varchar(255) DEFAULT NULL,
    created_at DATETIME DEFAULT NULL,
    created_by DATETIME DEFAULT NULL,
    updated_by varchar(20) DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    google_id varchar(255) DEFAULT NULL,
    nation  varchar(20) DEFAULT NULL,
    dob varchar(20) DEFAULT NULL,
   skills  varchar(20) DEFAULT NULL,
   experience  varchar(20) DEFAULT NULL,
   projects  varchar(90) DEFAULT NULL

  ) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4
`;

pingdb.query(usersTable, function (err, result) {
  if (err)
    console.error("Error creating users table:", err);
});

module.exports = usersTable;
