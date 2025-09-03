const mysql = require("mysql2");

// Create a connection to the MySQL server
// const connection = mysql.createConnection({
//   host: "ss-yh-jul-db.cdk68yukwack.ap-south-1.rds.amazonaws.com",
//   user: "techtrail_dba",
//   password: "tech-trail4u",
//   database: "indrayani_db"
// });

// const connection = mysql.createConnection({
//   host: "ragp-aug24-db.c1uo40wgmpci.ap-south-1.rds.amazonaws.com",
//   user: "techtrail_dba",
//   password: "tech-trail4u",
//   database: "indrayani_db"
// });

// Create a connection to the MySQL server
const connection = mysql.createConnection({
  // host: "127.0.0.1",
  // user: "root",
  // password: "root123",
  // database: "smartstepai",
  // port: "3307",

  // DB_HOST: gondola.proxy.rlwy.net,
  // DB_PORT: 35752,
  // DB_USER: root,
  // DB_PASS: FucZVLgwvCnWLImsuBrJoMEWsFPVSiFb,
  // DB_NAME: railway,
  // // PORT: 3306,
  host: gondola.proxy.rlwy.net,
  port: 35752,
  user: root,
  password: FucZVLgwvCnWLImsuBrJoMEWsFPVSiFb,
  database : railway,
  // PORT: 3306,
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  } else {
    require("./index.js");
    console.log("Connected to MySQL!");
  }
});

module.exports = connection;
