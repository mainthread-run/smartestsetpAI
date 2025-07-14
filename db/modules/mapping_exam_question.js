const pingdb = require("../db_connection");

var mappingExamQuestionTable = `
  CREATE TABLE IF NOT EXISTS mapping_exam_question (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    exam_code varchar(255) NOT NULL,
    question_id int NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

pingdb.query(mappingExamQuestionTable, function (err, result) {
  if (err)
    console.error("Error creating mapping_exam_question table:", err);
});

module.exports = mappingExamQuestionTable;
