const util = require("util");
const indrayniDB = require("../../db/db_connection");
const validations = require("../../helper/validations");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

const deleteUser = async (req, res) => {
    try {
        let user_id = req.params.user_id;
        let { updated_by } = req.body;

        if (!validations.isValidateNumber(user_id)) {
            return res.status(400).json({ message: 'Invalid user_id format' });
        }
        
        let checkAdminQuery = `SELECT * FROM users WHERE user_id = '${updated_by}' AND role = 'Admin'`;
        let adminUser = await queryAsync(checkAdminQuery);

        if (adminUser.length === 0) {
            return res.status(403).json({ message: "You are not authorized to delete users or user already deleted" });
        }

        let deleteUserQuery = `UPDATE users SET is_deleted = 1,updated_by='${updated_by}',updated_at=NOW() WHERE user_id = '${user_id}'`;
        let result = await queryAsync(deleteUserQuery);

        if (result.affectedRows > 0) {
            return res.json({ message: "User deleted successfully" });
        } else {
            return res.status(404).json({ message: "User not found or deletion failed" });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { deleteUser };
