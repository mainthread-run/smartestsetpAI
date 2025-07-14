const pingdb = require("../db_connection");

const marksStagingTable = `
  CREATE TABLE IF NOT EXISTS marks_staging (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    obtained_mark FLOAT NOT NULL,
    staged_type VARCHAR(50) NOT NULL,
    total_mark FLOAT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

pingdb.query(marksStagingTable, function (err, result) {
  if (err) {
    console.error("Error creating marks_staging table:", err);
  } else {
    console.log("marks_staging table created or already exists.");
  }
});

module.exports = marksStagingTable;
