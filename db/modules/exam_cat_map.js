const indrayanidb = require("../db_connection");

var exam_cat_map_table = `
  CREATE TABLE IF NOT EXISTS exam_cat_map (
    id int NOT NULL AUTO_INCREMENT,
    exam_code varchar(20) NOT NULL,
    category_id int NOT NULL,
    PRIMARY KEY (id)
  )
`;

indrayanidb.query(exam_cat_map_table, function (err, result) {
  if (err)
    console.error("Error creating exam_cat_map_table table:", err);
});

module.exports = exam_cat_map_table;
