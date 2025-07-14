const usersTable = require("./modules/users");
const examTable = require("./modules/exams");
const trendingExamsTable = require("./modules/trending_upcoming_exams");
const questionsTable = require("./modules/questions");
const categoriesTable = require("./modules/categories");
const exam_cat_mapTable = require("./modules/exam_cat_map");
const exam_que_mappingTable = require("./modules/mapping_exam_question");
const transactionTable = require("./modules/transaction");
const subscriptionTable = require("./modules/subscription");
const examResultTable = require("./modules/exam_results");
const examResultDetatilsTable = require("./modules/exam_result_details");
const info_video = require("./modules/info_video");
const orderTable = require("./modules/order");
const orderExamMppTable = require("./modules/ord_exam_mapping");
const marks_staging = require("./modules/marks_staging")
module.exports = {
  usersTable,
  trendingExamsTable,
  examTable,
  questionsTable,
  categoriesTable,
  exam_cat_mapTable,
  exam_que_mappingTable,
  info_video,
  orderTable,
  orderExamMppTable,
  marks_staging
};
