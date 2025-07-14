const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

let getquestion = async (req, res) => {
    try {
        const { exam_code, unmap_questions, question, difficulty } = req.query;

        let selectQuestion = `
            SELECT 
                q.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT('exam_code', e.exam_code, 'exam_name', e.exam_name)
                ) AS map_exams,
                COUNT(e.exam_code) AS exam_count
            FROM questions q
            LEFT JOIN mapping_exam_question meq ON q.question_id = meq.question_id
            LEFT JOIN exams e ON meq.exam_code = e.exam_code
        `;

        let params = [];
        let whereClauses = [];

        if (exam_code) {
            // whereClauses.push('meq.exam_code = ? AND q.is_active = 1');
            whereClauses.push('meq.exam_code = ?' )
            params.push(exam_code);
        }

        if (unmap_questions) {
            whereClauses.push(`
                q.question_id NOT IN (
                    SELECT question_id
                    FROM mapping_exam_question
                    WHERE exam_code = ?
                )
                AND q.is_active = 1
            `);
            params.push(unmap_questions);
        }

        if (question) {
            whereClauses.push('q.question LIKE ?');
            params.push(`%${question}%`);
        }

        if (difficulty) {
            whereClauses.push('q.difficulty_level = ?');
            params.push(difficulty);
        }

        if (whereClauses.length > 0) {
            selectQuestion += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        selectQuestion += ' GROUP BY q.question_id'; // Group by question_id to aggregate exams

        let result = await queryAsync(selectQuestion, params);

        // Parse map_exam JSON fields if necessary
        result.forEach(row => {
            try {
                row.map_exams = JSON.parse(row.map_exams || '[]');
            } catch (error) {
                row.map_exams = [];
            }
        });

        if (result.length > 0) {
            return res.json({ data: result, length: result.length });
        } else {
            return res.status(404).json({ message: "No questions found" });
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

module.exports = { getquestion };
