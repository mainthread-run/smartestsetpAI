const indrayanidb = require("../db_connection");

var examResultDetails = `
  CREATE TABLE IF NOT EXISTS exam_result_details (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
    result_id INT NOT NULL,
    question_id INT NOT NULL,
    seloption INT,
    time_taken INT,
    iscorrectopt INT NOT NULL DEFAULT 0
  )
`;

indrayanidb.query(examResultDetails, function (err, result) {
  if (err)
    console.error("Error creating exam_result_details table:", err);
});

module.exports = examResultDetails;
