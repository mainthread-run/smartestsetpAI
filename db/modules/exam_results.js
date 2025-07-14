const indrayanidb = require("../db_connection");

var examResultsTable = `
    CREATE TABLE IF NOT EXISTS exam_results (
    result_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id int NOT NULL,
    exam_code varchar(255) NOT NULL,
    score int DEFAULT NULL,
    attempted_at DATETIME DEFAULT NULL,
    time_taken int,
    skip_ans int,
    unskip_ans int,
    wrong_ans int,
    right_ans int,
    total_questions int,
    question_avg_time int
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

indrayanidb.query(examResultsTable, function (err, result) {
  if (err)
    console.error("Error creating users table:", err);
});

module.exports = examResultsTable;
