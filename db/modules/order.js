const indrayaniDB = require("../db_connection");

var orderTable = `
CREATE TABLE IF NOT EXISTS orders (
    order_id INT UNIQUE AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payable_amount DECIMAL(10, 2) NOT NULL,
    discount INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by INT DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;
`;

indrayaniDB.query(orderTable, function (err, result) {
  if (err) {
    console.error("Error creating transcation table:", err);
  }
});

module.exports = orderTable;
