const indrayaniDB = require("../db_connection");

var subscriptionTable = `
CREATE TABLE IF NOT EXISTS subscriptions (
    sub_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_code varchar(255) NOT NULL,
    order_id INT NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

indrayaniDB.query(subscriptionTable, function (err, result) {
  if (err) {
    console.error("Error creating subscriptions table:", err);
  }
});

module.exports = subscriptionTable;
