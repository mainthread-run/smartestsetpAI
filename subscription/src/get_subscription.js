
const util = require("util");
const indrayaniDB = require("../../db/db_connection");

const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

let get_subscription_exam = async (req, res) => {
    try {
        let { user_id, exam_code } = req.query;

        if (user_id) {
            const query = `
                SELECT 
                    s.user_id, 
                    s.exam_code, 
                    MIN(s.start_date) AS start_date, 
                    MAX(s.end_date) AS end_date, 
                    s.status, 
                    e.exam_name, 
                    e.difficulty_level
                FROM 
                    subscriptions s
                JOIN 
                    exams e ON s.exam_code = e.exam_code
                WHERE
                    s.user_id = '${user_id}'
                GROUP BY 
                    s.user_id, s.exam_code, s.status, e.exam_name, e.difficulty_level; 
            `;
        
            let result = await queryAsync(query);
        
            if (result.length > 0) {
                return res.json({ data: result });
            } else {
                return res.status(404).json({ message: "No exams found" });
            }
        }       
        let sql = `
        SELECT 
           s.*,
            e.difficulty_level, 
            e.exam_type, 
            u.email, 
            u.mobile, 
            e.exam_name, 
            e.img,
            CONCAT(u.first_name, ' ', u.last_name) AS user_name,
            s.status,
            COALESCE(COUNT(r.result_id), 0) AS exams_attempted
        FROM 
            subscriptions s
        JOIN 
            exams e ON s.exam_code = e.exam_code
        JOIN 
            users u ON s.user_id = u.user_id
        LEFT JOIN 
            exam_results r ON s.exam_code = r.exam_code AND s.user_id = r.user_id
        WHERE 1=1`;

        let queryParams = [];

        if (exam_code) {
            sql += ` AND s.exam_code = ?`;
            queryParams.push(exam_code);
        }
        // to avoid duplicate 
        sql += ` GROUP BY s.sub_id, s.user_id, s.exam_code, s.order_id, s.start_date, s.end_date, s.status, e.difficulty_level, 
        e.exam_type, u.email, u.mobile, e.exam_name, s.created_at, u.first_name, u.last_name`;


        let result = await queryAsync(sql, queryParams);


        if (result.length > 0) {
            return res.json({ data: result });
        } else {
            return res.status(404).json({ message: "No exams found" });
        }

    } catch (error) {
        console.error("Error fetching subscription exams:", error);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
};

module.exports = { get_subscription_exam };
