const util = require("util");
const indrayniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);
const map_exam_to_category = async ({ exam_code=null, category_id=null, category_ids=null, map_exams=null }) => {
    try {
          let query = "INSERT INTO exam_cat_map (exam_code, category_id)";
          let queryParams = [];
          
          // Validation for both scenarios
          if (
            (!exam_code || !Array.isArray(category_ids) || category_ids.length === 0) &&
            (!category_id || !Array.isArray(map_exams) || map_exams.length === 0)
          ) {
            return ({ status: false, message: 'Invalid request data for mapping' });
          }
          
          // Scenario 1: Mapping an exam to multiple categories
          if (exam_code && Array.isArray(category_ids) && category_ids.length > 0) {
            query += `
              SELECT ?, category_id
              FROM categories
              WHERE category_id IN (?)
              AND category_id NOT IN (
                SELECT category_id FROM exam_cat_map WHERE exam_code = ?
              )
            `;
            queryParams = [exam_code, category_ids, exam_code];
          }
      
          // Scenario 2: Mapping a category to multiple exams
          if (category_id && Array.isArray(map_exams) && map_exams.length > 0) {
            query += `
              SELECT exam_code, ?
              FROM exams
              WHERE exam_code IN (?)
              AND exam_code NOT IN (
                SELECT exam_code FROM exam_cat_map WHERE category_id = ?
              )
            `;
            queryParams = [category_id, map_exams, category_id];
          }
          
          let result = await queryAsync(query, queryParams);
          if (result.affectedRows > 0) {
            return ({ status: true });
          }
          return ({ status: false, status_code:400, message: "Unable to map" });
        } catch (error) {
          console.error("Error mapping exam-category:", error);
          return ({ status: false, message: 'Something went wrong'});
        }
}

const remove_mapping = async({ exam_code = null, category_id = null }) => {
  try {
      let query = "DELETE FROM exam_cat_map WHERE 1=1"; // 1=1 is a placeholder for easier conditional appending
      let queryParams = [];

      if (exam_code) {
          query += " AND exam_code = ?";
          queryParams.push(exam_code);
      }

      if (category_id) {
          query += " AND category_id = ?";
          queryParams.push(category_id);
      }

      const result = await queryAsync(query, queryParams);
      
      if (result.affectedRows > 0) {
          return { status: true };
      } else {
          return { status: false, message: 'No mapping found to remove' };
      }
  } catch (error) {
      console.error("Error removing mapping from exam-category:", error);
      return { status: false, message: 'Something went wrong' };
  }
};


module.exports = { map_exam_to_category, remove_mapping };
