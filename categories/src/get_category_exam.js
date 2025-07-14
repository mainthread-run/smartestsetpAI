const util = require('util');
const indrayaniDB = require('../../db/db_connection'); // Adjust the path as necessary

const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

let getCategoryExam = async (req, res) => {
    try {
        const { category_name } = req.query;
        
        // Base query to join categories, exam_cat_map, and exams
        let query = `
            SELECT 
                c.category_id, c.category_name, c.parent_category, e.*
            FROM 
                categories c
            LEFT JOIN 
                exam_cat_map ecm ON c.category_id = ecm.category_id
            LEFT JOIN 
                exams e ON ecm.exam_code = e.exam_code AND e.is_active = 1
            WHERE 
                c.is_active = 1
        `;
        
        // Add filter condition if category_name is provided
        if (category_name) {
            query += ` AND (c.category_name LIKE '%${category_name}%' 
                        OR EXISTS (
                            SELECT * 
                            FROM categories sub 
                            WHERE sub.parent_category = c.category_id 
                            AND sub.category_name LIKE '%${category_name}%'
                        ))`;
        }

        // Add ordering
        query += `
            ORDER BY 
                c.category_id, c.parent_category, e.exam_code
        `;

        let results = await queryAsync(query);

        // Maps to keep track of categories and their subcategories
        let categoryMap = new Map();
        let topLevelCategories = new Set();
        
        results.forEach(row => {
            // Initialize top-level categories set
            if (!row.parent_category) {
                topLevelCategories.add(row.category_id);
            }
                        
            // Initialize category in map
            if (!categoryMap.has(row.category_id)) {
                categoryMap.set(row.category_id, {
                    category_id: row.category_id,
                    category_name: row.category_name,
                    subcats: [],
                    exams: []
                });
            }

            // Handle parent categories
            if (row.parent_category) {
                let parentCategory = categoryMap.get(row.parent_category);
                if (parentCategory) {
                    if (!parentCategory.subcats.find(sub => sub.category_id === row.category_id)) {
                        parentCategory.subcats.push({
                            category_id: row.category_id,
                            category_name: row.category_name,
                            exams: []
                        });
                    }
                }
            }

            // Add exams to the respective category
            if (row.exam_code) {
                if (row.parent_category) {
                    // Add exam to subcategory
                    let subcat = categoryMap.get(row.parent_category).subcats.find(sub => sub.category_id === row.category_id);
                    if (subcat) {
                        subcat.exams.push({
                            ...row
                            // exam_code: row.exam_code,
                            // exam_name: row.exam_name
                        });
                    }
                }
            }
        });

        // Prepare final response with only top-level categories
        let response = [];
        topLevelCategories.forEach(catId => {
            let category = categoryMap.get(catId);
            if (category) {
                response.push({
                    category_id: category.category_id,
                    category_name: category.category_name,
                    subcats: category.subcats
                });
            }
        });

       return res.json({ data:{ categories:response }});
    } catch (error) {
        console.error('Error fetching category exam:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { getCategoryExam };
