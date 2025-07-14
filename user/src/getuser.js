const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const validations = require("../../helper/validations");

const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

let getUserDetail = async (req, res) => {
    try {
        let user_id = req.query.user_id;
        let sqlQuery;
        let queryParams = [];

        if (user_id) {
            sqlQuery = `
                SELECT 
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
                    u.email,
                    u.mobile,
                    u.created_at,
                    u.is_active,
                    u.opted_classes,
                    u.education,
                    u.city,
                    u.district,
                    u.state,
                    u.role,
                    u.pin_code,
                    IFNULL(u.updated_at, '') AS updated_at,
                  COALESCE(COUNT(s.exam_code),0) AS exams_opted, 
                    IFNULL(CONCAT(ub.first_name, ' ', ub.last_name), '') AS updated_by
                FROM 
                    users u
                LEFT JOIN 
                    subscriptions s ON u.user_id = s.user_id  
                LEFT JOIN 
                    users ub ON u.updated_by = ub.user_id
                WHERE 
                    u.user_id = '${user_id}'
                GROUP BY 
                    u.user_id, u.first_name, u.last_name, u.email, u.created_at, u.is_active, u.opted_classes, u.education, u.city, u.district, u.state, u.pin_code, u.updated_at, ub.first_name, ub.last_name
            `;
           
        } else {
            sqlQuery = `
                SELECT 
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
                    u.email,
                    u.mobile,
                    u.created_at,
                    u.is_active,
                    u.opted_classes,
                    u.education,
                    u.city,
                    u.district,
                    u.state,
                    u.role,
                    u.pin_code,
                    IFNULL(u.updated_at, '') AS updated_at,
                    COALESCE(COUNT(s.exam_code),0) AS exams_opted,  
                    IFNULL(CONCAT(ub.first_name, ' ', ub.last_name), '') AS updated_by
                FROM 
                    users u
                LEFT JOIN 
                    subscriptions s ON u.user_id = s.user_id  
                LEFT JOIN 
                    users ub ON u.updated_by = ub.user_id
                GROUP BY 
                    u.user_id, u.first_name, u.last_name, u.email, u.created_at, u.is_active, u.opted_classes, u.education, u.city, u.district, u.state, u.pin_code, u.updated_at, ub.first_name, ub.last_name
            `;
        }

        let result = await queryAsync(sqlQuery, queryParams);

        if (result.length > 0) {
            return res.json({ data: result });
        } else {
            return res.status(404).json({ message: "No users found" });
        }
    } catch (error) {
        console.error("Error in getting user details:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = { getUserDetail };









