const pingdb = require("../db_connection");

var mappingUserAnswerTable = `
  CREATE TABLE IF NOT EXISTS mapping_user_answer (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    mobile varchar(45) DEFAULT NULL,
    examId varchar(45) DEFAULT NULL,
    questionId varchar(45) DEFAULT NULL,
    answer varchar(45) DEFAULT NULL,
    answeredOn datetime DEFAULT NULL,
    endedOn datetime DEFAULT NULL
  ) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;
`;

pingdb.query(mappingUserAnswerTable, function (err, result) {
  if (err)
    console.error("Error creating mapping_user_answer table:", err);
});

module.exports = mappingUserAnswerTable;
