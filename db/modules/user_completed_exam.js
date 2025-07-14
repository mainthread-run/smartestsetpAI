const pingdb = require("../db_connection");

var userCompletedExamTable = `
  CREATE TABLE IF NOT EXISTS user_completed_exam (
    id int NOT NULL AUTO_INCREMENT,
    mobile varchar(45) DEFAULT NULL,
    examId int DEFAULT NULL,
    endedOn datetime DEFAULT NULL,
    percentage int DEFAULT NULL,
    totalQuestion int DEFAULT NULL,
    ansSkip int DEFAULT NULL,
    ansRight int DEFAULT NULL,
    ansWrong int DEFAULT NULL,
    passingMarks int DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id)
  ) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;
`;

pingdb.query(userCompletedExamTable, function (err, result) {
  if (err)
    console.error("Error creating user_completed_exam table:", err);
});

module.exports = userCompletedExamTable;
