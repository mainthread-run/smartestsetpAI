const util = require("util");
const indrayniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);
const examUnmapping = require("../../categories/src/exam_cat_mapping");

let saveCategory = async (req, res) => {
    try {
        // Check if user is an admin
        if (req.user.role !== 'Admin') {
            return res.status(401).json({ message: "You are not authorized." });
        }

        const { category_name, description, order_number, parent_category, created_by, updated_by, is_active } = req.body;
        const category_id = req.params.category_id;

        if (!category_name || !description || !order_number || (!created_by && !updated_by)) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        // Start a transaction
        await queryAsync("START TRANSACTION");

        let query, queryData; 
        if (category_id) {
            // Update existing category
            const parent_cat = is_active == 0 ? null : parent_category;
            query = `
                UPDATE categories
                SET category_name = ?, is_active = ?, description = ?, order_number = ?, parent_category = ?, updated_at = NOW(), updated_by = ?
                WHERE category_id = ?
            `;
            queryData = [category_name.trim(), is_active, description.trim(), order_number, parent_cat, updated_by, category_id];
        } else {
            // Add new category
            query = `
                INSERT INTO categories (category_name, description, order_number, parent_category, created_at, created_by)
                VALUES (?, ?, ?, ?, NOW(), ?)
            `;
            queryData = [category_name.trim(), description.trim(), order_number, parent_category || null, created_by];
        }

        // Execute the query
        const result = await queryAsync(query, queryData);

        // Check if the update or insert was successful
        if (result.affectedRows > 0) {
            // If category is being deactivated, remove exam mappings if they exist
            if (is_active == 0 && category_id) {
                // Check if there are existing mappings for the category
                const mappings = await queryAsync("SELECT COUNT(*) AS count FROM exam_cat_map WHERE category_id = ?", [category_id]);
                
                if (mappings[0].count > 0) {
                    const removeResult = await examUnmapping.remove_mapping({ category_id: category_id });
                    if (removeResult.status === false) {
                        await queryAsync("ROLLBACK");
                        return res.status(500).json({ message: 'Category deactivated but failed to remove exam mappings.' });
                    }
                }
            }
            await queryAsync("COMMIT");
            return res.json({ message: category_id ? "Category updated successfully." : "Category added successfully." });
        } else {
            await queryAsync("ROLLBACK");
            return res.status(500).json({ message: category_id ? "Unable to update category." : "Unable to add category." });
        }
    } catch (error) {
         await queryAsync("ROLLBACK");

        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Category name already exists. Please choose a different name." });
        }

        // Log the error for debugging purposes
        console.error("Error in saving category:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = { saveCategory };
