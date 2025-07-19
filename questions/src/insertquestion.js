const util = require("util");
const fs = require("fs");
const XLSX = require("xlsx");
const { parse } = require("csv-parse");
const indrayniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

const questions = async (req, res) => {
    try {
        let data = [];
        let incompleteDataMessages = [];

        let successCount = 0;

        // Check if a file is uploaded
        if (req.files?.que_file) {
            const file = req.files.que_file;

            // Check if the file is actually provided
            if (!file || file.size === 0) {
                return res.status(400).json({ message: "No file uploaded or file is empty" });
            }

            const filePath = `./public/${file.name}`;
            await file.mv(filePath);

            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (fileExtension === 'xlsx') {
                // Read and parse the Excel file
                const workbook = XLSX.readFile(filePath);
                const sheetNames = workbook.SheetNames;
                const sheet = workbook.Sheets[sheetNames[0]];
                data = XLSX.utils.sheet_to_json(sheet);
            } else if (fileExtension === 'csv') {
                // Read and parse the CSV file
                const fileContent = fs.readFileSync(filePath);
                data = await new Promise((resolve, reject) => {
                    parse(fileContent, { columns: true, skip_empty_lines: true }, (err, records) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(records);
                        }
                    });
                });
            } else {
                fs.unlinkSync(filePath);
                return res.status(400).json({ message: "Unsupported file type" });
            }

            // Delete the file after processing
            fs.unlinkSync(filePath);
        }
        else {
            // Use data from request body if no file is provided
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ message: "No data provided " });
            }

            data.push(req.body);
        }

        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            let row = data[rowIndex];

            let clearCol = {};
            for (let key in row) {
                let colKey = key.replace(/\t/g, '').trim(); // Remove tab characters and trim key
                let clearColValue = (row[key] && row[key].toString().trim()) || null;

                clearCol[colKey] = clearColValue;
            }

            let { question, option1, option2, option3, option4, right_option, difficulty_level, description, note, map_exams } = clearCol;
          //  let created_by = req.user.user_id;

          let created_by = 1;

            // Check for missing required fields
            if (!question || !option1 || !option2 || !option3 || !option4 || !right_option || !difficulty_level ) {
                incompleteDataMessages.push(`Row ${rowIndex + 1}:Not getting all required fields . Skipping this row.`);
                continue; // Skip this row and move to the next one
            }



            // Check if right_option is null or not in the range of 1 to 4
            if (right_option === null || right_option === undefined || isNaN(right_option)) {
                incompleteDataMessages.push(`Row ${rowIndex + 1}: All fields are required.`);
                continue; // Skip this row and move to the next one
            }

            right_option = parseInt(right_option, 10);


            if (right_option < 1 || right_option > 4) {

                incompleteDataMessages.push(`Row ${rowIndex + 1}: 'right_option' must be a number between 1 and 4.`);
                continue; // Skip this row and move to the next one
            };




            // Normalize difficulty_level to lowercase
            difficulty_level = difficulty_level.toLowerCase();

            // Validate difficulty_level
            const validDifficulties = ['normal', 'medium', 'hard'];
            if (!validDifficulties.includes(difficulty_level)) {
                incompleteDataMessages.push(`Row ${rowIndex + 1}: 'difficulty_level' must be one of the following: ${validDifficulties.join(', ')}`);
                continue;
            }



            // if (req.user.role !== 'Admin' || req.user.user_id !== created_by) {
            //     return res.status(403).json({ message: "You are not authorized to add questions" });
            // }

            let insertQuestionQuery = `
                INSERT INTO questions (
                    question, 
                    option1, 
                    option2, 
                    option3, 
                    option4, 
                    right_option, 
                    difficulty_level, 
                    description, 
                    note, 
                    created_at,
                    created_by 
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),?)`;

            let insertData = [
              question,
              option1,
              option2,
              option3,
              option4,
              right_option,
              difficulty_level,
              description,
              note,
              created_by,
            ];

            let result = await queryAsync(insertQuestionQuery, insertData);

            if (result.affectedRows > 0) {
                successCount++;

                // Map question to new exams if provided
            //     if (map_exams && map_exams.length > 0) {
            //         let mappingResult = await exam_map_unmap.exam_question_mapping({
            //             body: {
            //                 question_id: result.insertId,
            //                 map_exams: req.body.map_exams
            //             }
            //         }, res);
            //         if (mappingResult.status !== true) {
            //             return res.status(400).json({ message: `Question added successfully but ` + mappingResult.message });
            //         }
            //     }
            // } else {
            //     insertResults.push({ question, status: 'Failed', reason: 'Unable to add question' });
            // }
        }
        }
        if (successCount > 0) {
            return res.json({
                message: "Questions added successfully",
                incompleteData: incompleteDataMessages
            });
        } else {
            return res.status(400).json({
                message: "All fields are required, or check that the given field is in the proper format ",


            });
        }

    } catch (error) {
        console.error("Error in adding questions:", error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = { questions };





