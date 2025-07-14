const indrayaniDB = require("../db_connection");

var orderExamMppTable = `
CREATE TABLE IF NOT EXISTS ord_exa_map (
    oe_id INT UNIQUE AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    exam_code VARCHAR(45) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;
`;

indrayaniDB.query(orderExamMppTable, function (err, result) {
  if (err) {
    console.error("Error creating transcation table:", err);
  }
});

module.exports = orderExamMppTable;
