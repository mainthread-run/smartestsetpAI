
const util = require("util");
const indrayniDB = require("../../db/db_connection");
const validations = require("../../helper/validations");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

let deleteCategories = async (req, res) => {
    try {
        let category_id = req.params.category_id;
       

        let deleteMappingsQuery = `DELETE FROM exam_cat_map WHERE category_id = '${category_id}'`;
        let mappingResult = await queryAsync(deleteMappingsQuery);

        if (mappingResult.affectedRows === 0) {
            console.log("No mappings found for category_id");
        }

        let deleteCategoryQuery = `DELETE FROM categories WHERE category_id = '${category_id}'`;
        let result = await queryAsync(deleteCategoryQuery);

        if (result.affectedRows > 0) {
            return res.json({ message: "Category and associated mappings deleted successfully" });
        } else {
            return res.status(404).json({ message: "Category not found or deletion failed" });
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { deleteCategories };
