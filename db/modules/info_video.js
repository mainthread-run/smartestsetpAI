const pingdb = require("../db_connection");

var infoVideoTable = `
  CREATE TABLE IF NOT EXISTS info_video (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title varchar(45) DEFAULT NULL,
    content longtext,
    type varchar(45) NOT NULL,
    image varchar(150) DEFAULT NULL,
    external_url varchar(500) DEFAULT NULL,
    created_at datetime DEFAULT NULL,
    created_by varchar(45) DEFAULT NULL,
    updated_at datetime DEFAULT NULL,
    updated_by varchar(45) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

pingdb.query(infoVideoTable, function (err, result) {
  if (err)
    console.error("Error creating info_video table:", err);
});

module.exports = infoVideoTable;
