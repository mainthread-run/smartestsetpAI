const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);
const file_upload = require("../../helper/file_upload");

const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/[\w\-\.]*)*(\?[;&a-z\=\d\-_]*)?$/i;

let update_video_info = async (req, res) => {
    try {
        let { title, content, type, external_url, updated_by } = req.body;
        let { id } = req.params;

        if (req.user.role !== 'Admin' && req.user.user_id !== updated_by) {
            return res.status(403).json({ message: "You are not authorized to update this video" });
        }

        if (!id || !title || !type || !updated_by) {
            return res.status(400).json({ message: "Provide required fields" });
        }

        if (external_url && !urlRegex.test(external_url)) {
            return res.status(400).json({ message: "Invalid external URL format" });
        }

        const image = req.files?.image;
        let filename = req.body.image || null;

        if (image) {
            let file_upload_res = await file_upload(image, "info_video_image");
            if (!file_upload_res.status) {
                return res.status(500).json({ message: file_upload_res.message });
            }
            filename = file_upload_res.filename;
        }

        const sqlQuery = `
            UPDATE info_video
            SET title = ?, content = ?, type = ?, external_url = ?, updated_at = NOW(), updated_by = ?, image = ?
            WHERE id = ?
        `;
        let updateData = [title, content, type, external_url, updated_by, filename, id];

        let result = await queryAsync(sqlQuery, updateData);

        if (result.affectedRows > 0) {
            return res.json({ message: "Video information updated successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update video information" });
        }
    } catch (error) {
        console.error("Error in updating video information:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = { update_video_info };
