const util = require('util');
const indrayniDB = require('../../db/db_connection');
const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);
// const exam_map_unmap = require('../../exam/src/exam_que_mapping');
const exam_map_unmap = require("../../db/modules/mapping_exam_question");
const updatequestion = async (req, res) => {
    try {
        const question_id = req.params.question_id;

        if (req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'You are not allowed to update this question' });
        }

        const {
            question, option1, option2, option3, option4, right_option,
            difficulty_level, description, note, updated_by, is_active, map_exams
        } = req.body;

        const updateQuestion = `
            UPDATE questions SET 
                question=?, option1=?, option2=?, option3=?, option4=?, 
                right_option=?, difficulty_level=?, description=?, 
                note=?, updated_by=?, updated_at=NOW(), is_active=?
            WHERE question_id=?
        `;

        const updateData = [
            question, option1, option2, option3, option4, right_option,
            difficulty_level, description, note, updated_by, is_active,
            question_id
        ];

        const result = await queryAsync(updateQuestion, updateData);

        if (result.affectedRows > 0) {
            // Map question to new exams if provided
            if (Array.isArray(map_exams) && map_exams.length > 0 && !map_exams.every(item => item === null)) {
                // Unmap question from exams
                await exam_map_unmap.exam_question_unmapping({
                    body: { question_id }
                }, res);

                // Map question to new exams
                let mappingResult = await exam_map_unmap.exam_question_mapping({
                    body: {
                        question_id,
                        map_exams
                    }
                }, res);
                if (mappingResult.status !== true) {
                    return res.status(400).json({ message: `Question updated successfully but ` + mappingResult.message });
                }
            }
            return res.status(200).json({ message: 'Question updated successfully' });
        } else {
            return res.status(404).json({ message: 'Question not found or update failed' });
        }
    } catch (error) {
        console.error('Error updating question:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

module.exports = { updatequestion };
