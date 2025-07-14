const indrayaniDB = require("../db_connection");

var transcationTable = `
CREATE TABLE IF NOT EXISTS transcation (
    trans_id INT UNIQUE AUTO_INCREMENT PRIMARY KEY,
    transaction_id varchar(255) UNIQUE NOT NULL,
    order_id INT UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    banktrans_id varchar(255) UNIQUE DEFAULT NULL,
    transaction_date DATETIME NOT NULL,
    transaction_status varchar(45) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by INT DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;
`;

indrayaniDB.query(transcationTable, function (err, result) {
  if (err) {
    console.error("Error creating transcation table:", err);
  }
});

module.exports = transcationTable;
