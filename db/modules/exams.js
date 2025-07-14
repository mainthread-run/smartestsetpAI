const indrayaniDB = require("../db_connection");

var examsTable = `
  CREATE TABLE IF NOT EXISTS exams (
    exam_code varchar(45) NOT NULL PRIMARY KEY UNIQUE KEY,
    exam_name varchar(20) NOT NULL,
    exam_desc varchar(45) DEFAULT NULL,
    exam_type varchar(45) DEFAULT NULL,
    price int DEFAULT '0',
    exam_duration int DEFAULT '60',
    total_questions int DEFAULT '50',
    total_marks int,
    passing_marks int DEFAULT '0',
    passing_percent int DEFAULT '0',
    difficulty_level varchar(45) DEFAULT NULL,
    img varchar(255) DEFAULT NULL,
    right_ans int DEFAULT '1',
    wrong_ans int DEFAULT '0',
    skip_ans int DEFAULT '0',
    is_active tinyint DEFAULT '1',
    created_at datetime,
    created_by int NOT NULL,
    updated_by varchar(45) DEFAULT NULL,
    updated_at datetime DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

indrayaniDB.query(examsTable, function (err, result) {
  if (err) console.error("Error creating exams table:", err);
});

module.exports = examsTable;
