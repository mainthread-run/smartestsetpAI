const util = require("util");
const indrayniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);
// const unmapping_exam = require("../../exam/src/exam_que_mapping")
const unmapping_exam = require("../../db/modules/mapping_exam_question");
let deletequestion = async(req, res) => {
    try {
        // use validation
        let question_id = req.params.question_id;
        
        // if (req.user.role !== 'Admin') {
        //     return res.status(401).json({ message: 'You are not authorized!' });
        // }

        const unmappingResult = await unmapping_exam.exam_question_unmapping({
            body: { question_id }
        }, res);
        // -------------im changigng it

        // const unmappingResult = await unmapping_exam.exam_question_unmapping( question_id );





        if (unmappingResult?.status === false) {
            return res.status(400).json({ message: unmappingResult.message });
        }
        
        let deleteQuestion = `DELETE FROM questions WHERE question_id = '${question_id}'`;
        let result = await queryAsync(deleteQuestion);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Question deleted successfully" });
        } else {
            res.status(404).json({ message: "Question not found or delete failed" });
        }
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { deletequestion };