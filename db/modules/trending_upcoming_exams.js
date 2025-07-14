const indrayanidb = require("../db_connection");

var trendingExamsTable = `
  CREATE TABLE IF NOT EXISTS trending_upcoming_exams (
    id int NOT NULL AUTO_INCREMENT,
    exam_code varchar(255) UNIQUE DEFAULT NULL,
    type varchar(45) DEFAULT NULL,
    order_no int DEFAULT NULL,
    launch_date datetime DEFAULT NULL,
    created_at datetime DEFAULT NULL,
    created_by int DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

indrayanidb.query(trendingExamsTable, function (err, result) {
  if (err)
    console.error("Error creating trending_upcoming_exams table:", err);
});

module.exports = trendingExamsTable;
