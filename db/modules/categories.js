const indrayaniDB = require("../db_connection");

const categoriesTable = `
  CREATE TABLE IF NOT EXISTS categories (
    category_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name varchar(45) UNIQUE NOT NULL,
    image varchar(255) DEFAULT NULL,
    description varchar(255) DEFAULT NULL,
    order_number int DEFAULT NULL,
    parent_category int DEFAULT NULL,
    created_at datetime DEFAULT NULL,
    created_by int DEFAULT NULL,
    updated_by int DEFAULT NULL,
    updated_at datetime DEFAULT NULL, 
    is_active tinyint DEFAULT '1'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

indrayaniDB.query(categoriesTable, function(err, result) {
    if (err) {
        console.error("Error creating categories table:", err);
    }
});

module.exports = {
    createCategoriesTable: function() {
        return indrayaniDB.query(categoriesTable);
    }
};
