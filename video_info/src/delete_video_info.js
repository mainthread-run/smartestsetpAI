const util = require("util");
const indrayaniDB = require("../../db/db_connection");
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

let delete_video_info = async (req, res) => {
    try {
        let { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Provide id" });
        }

        // Check if the user has the authorization to delete the video
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "You are not authorized to delete this video" });
        }

        const sqlQuery = `
            DELETE FROM info_video
            WHERE id = ?
        `;
        let result = await queryAsync(sqlQuery, [id]);

        if (result.affectedRows > 0) {
            return res.json({ message: "Deleted successfully" });
        } 
        else {
            return res.status(404).json({ message: "Video not found" });
        }
    } catch (error) {
        console.error("Error in deleting video information:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = { delete_video_info };
