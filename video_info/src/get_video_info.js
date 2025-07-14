const util = require("util");
const indrayaniDB = require("../../db/db_connection");

const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

const get_video_info = async (req, res) => {
    try {
        // Retrieve parameters from the query string
        const { type, id } = req.query;

        // Base SQL query with JOINs
        let sqlQuery = `
            SELECT iv.*,
                   CONCAT(uc.first_name, ' ', uc.last_name) AS created_by,
                   CONCAT(uu.first_name, ' ', uu.last_name) AS updated_by
            FROM info_video iv
            LEFT JOIN users uc ON iv.created_by = uc.user_id
            LEFT JOIN users uu ON iv.updated_by = uu.user_id
        `;
        let params = [];

        // Build WHERE clause based on provided parameters
        const conditions = [];

        if (id) {
            conditions.push('iv.id = ?');
            params.push(id);
        }
        if (type) {
            conditions.push('iv.type = ?');
            params.push(type);
        }

        // If there are conditions, append them to the SQL query
        if (conditions.length > 0) {
            sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Execute the query
        const result = await queryAsync(sqlQuery, params);

        if (result.length > 0) {
            return res.json({ data: result });
        } else {
            return res.status(404).json({ message: "No data found" });
        }
    } catch (error) {
        console.error("Error in getting video info:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};


module.exports = { get_video_info };
