const util = require("util");
const indrayniDB = require("../../db/db_connection");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

let getCategories = async (req, res) => {
    try {
        let {category_id, map_cat, parent_cat } = req.query
        
        let selectCategories = `
            SELECT 
                c.*, 
                IFNULL(pc.category_name, '') AS parent_category_name,
                CONCAT(uc.first_name, ' ', uc.last_name) AS created_by, 
                CONCAT(uu.first_name, ' ', uu.last_name) AS updated_by
            FROM categories c
            LEFT JOIN categories pc ON c.parent_category = pc.category_id
            LEFT JOIN users uc ON c.created_by = uc.user_id
            LEFT JOIN users uu ON c.updated_by = uu.user_id
            WHERE 1=1`;

        let queryParams = [];

        // Check if map_cat query parameter is true
        if (map_cat === "true") {
            selectCategories += ` AND c.parent_category IS NOT NULL AND c.is_active = 1`;
        }
        
        // Check if map_cat query parameter is null
        if (parent_cat === "true") {
            selectCategories += ` AND c.parent_category IS NULL`;
        }

        // Filter by category_id if provided
        if (category_id) {
            selectCategories += ` AND c.category_id = ?`;
            queryParams.push(category_id);
        }

        // Execute the query
        let result = await queryAsync(selectCategories, queryParams);

        // Respond with the result
        if (result.length > 0) {
            return res.json({ data: result });
        } else {
            return res.status(404).json({ message: "No categories found" });
        }
        
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { getCategories };
