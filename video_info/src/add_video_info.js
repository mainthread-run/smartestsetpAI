const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const file_upload = require("../../helper/file_upload");

const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/[\w\-\.]*)*(\?[;&a-z\=\d\-_]*)?$/i;

let add_video_info = async (req, res) => {
    try {
        let { title, content, type, external_url, created_by } = req.body;
        if (req.user.role !== 'Admin' && req.user.user_id !== created_by) {
            return res.status(403).json({ message: "You are not authorized to map exams" });
        }

        if (!title || !type || !created_by) {
            return res.status(400).json({ message: "Provide required filed" });
        }
        
        if (external_url && !urlRegex.test(external_url)) {
            return res.status(400).json({ message: "Invalid external URL format" });
        }

        const image = req.files?.image;
        let filename = null;

        if (image) {
            let file_upload_res = await file_upload(image, "info_video_image");
            if (!file_upload_res.status) {
                return res.status(500).json({ message: file_upload_res.message });
            }
            filename = file_upload_res.filename;
        }

        const sqlQuery = `
            INSERT INTO info_video (title, content, type, external_url, created_at, created_by,image) 
            VALUES (?, ?, ?, ?, NOW(), ?, ?)
        `;

        let insertData = [title, content, type, external_url, created_by,filename];

        let result = await queryAsync(sqlQuery, insertData);

        if (result.affectedRows > 0) {
            return res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully` });
        } else {
            return res.status(500).json({ message: "Failed to insert Article and Video information" });
        }
    } catch (error) {
        console.error("Error in inserting Article information:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = { add_video_info };
