const indrayanidb = require("../db_connection");

const questionsTable =
  `CREATE TABLE IF NOT EXISTS questions (
      question_id int NOT NULL AUTO_INCREMENT,
      question longtext NOT NULL,
      option1 longtext NOT NULL,
      option2 longtext NOT NULL,
      option3 longtext NOT NULL,
      option4 longtext NOT NULL,
      right_option int NOT NULL,
      difficulty_level varchar(45) DEFAULT NULL,
      description longtext DEFAULT NULL,
      note longtext DEFAULT NULL,
      created_at datetime DEFAULT NULL,
      created_by int NOT NULL,
      updated_by int DEFAULT NULL,
      updated_at datetime DEFAULT NULL,
      is_active tinyint DEFAULT '1',
      PRIMARY KEY (question_id),
      UNIQUE KEY question_id_UNIQUE (question_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  indrayanidb.query(questionsTable, function (err, result) {
    if (err)
      console.error("Error creating questions table:", err);
  });
  
  module.exports = questionsTable;
