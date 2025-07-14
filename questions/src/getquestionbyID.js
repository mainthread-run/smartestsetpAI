const util = require("util");
const indrayniDB = require("../../db/db_connection");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

let getquestionbyid = async (req, res) => {
    try {
        let question_id = req.params.question_id;

        // Validate question_id
        if (!isValidNumber(question_id)) {
            return res.status(400).json({ message: "Invalid question_id. It must be a number." });
        }

        // SQL query to retrieve question along with creator and updater names
        let selectQuestion = `
            SELECT q.*, 
                   CONCAT(u1.first_name, ' ', u1.last_name) AS created_by,
                   CONCAT(u2.first_name, ' ', u2.last_name) AS updated_by
            FROM questions q
            LEFT JOIN users u1 ON q.created_by = u1.user_id
            LEFT JOIN users u2 ON q.updated_by = u2.user_id
            WHERE q.question_id = '${question_id}'`;

        let result = await queryAsync(selectQuestion);

        if (result.length > 0) {
            result = result.map(question => ({
                ...question,
                created_by: question.created_by || '',
                updated_by: question.updated_by || '',
                updated_at: question.updated_at || '',
            }));

            return res.json({ data: result });
        } else {
            return res.status(404).json({ message: "Question not found" });
        }
    } catch (error) {
        console.error("Error fetching question:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

function isValidNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

module.exports = { getquestionbyid };

