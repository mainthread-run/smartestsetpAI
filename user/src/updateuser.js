const util = require("util");
const indrayniDB = require("../../db/db_connection");
const validations = require("../../helper/validations");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

let updateUserDetail = async (req, res) => {
    try {
        let user_id = req.params.user_id;

        let { first_name, last_name, mobile, email, city, district, state,
                pin_code, education, opted_classes, address,role , is_active, updated_by } = req.body;

                
        if (!validations.isValidateNumber(user_id)) {
            return res.status(400).json({ message: 'Invalid user_id format' });
        }
        
        // Query to check if the user is an admin
        let checkAdminQuery = `SELECT * FROM users WHERE user_id = '${updated_by}' AND role = 'Admin'`;
        let adminUser = await queryAsync(checkAdminQuery);
        
        if(adminUser.length > 0){

         let duplicateCheckQuery = `SELECT * FROM users  WHERE (email = '${email}' OR mobile ='${mobile}') 
            AND NOT user_id = '${user_id}' `;
         let duplicateResults = await queryAsync(duplicateCheckQuery);

        if (duplicateResults.length > 0) {
             return res.status(400).json({ message: 'Email or mobile number is already in use.' });
             }
        }

        let updateUserQuery = `UPDATE users SET first_name=?,last_name=?,city=?,district=?,state=?,pin_code=?,
        education=?,opted_classes=?,address=?,role=?,is_active=?,updated_by=?,updated_at= NOW()`;
        let updateData = [first_name,last_name,city,district,state,
            pin_code,education,opted_classes,address,role,is_active,updated_by];
        let result;

   if(adminUser.length > 0){

    updateUserQuery +=`,mobile=?,email=? WHERE user_id = ?`
    updateData.push(mobile,email,user_id)   

    }else{
        
        updateUserQuery +=` WHERE user_id = ?`
        updateData.push(user_id) ;
    }
    result = await queryAsync(updateUserQuery, updateData);

    if (result.affectedRows > 0) {
        return res.json({ message: "User updated successfully." });
    } else {
        return res.status(404).json({ message: "User not found or update failed." });
    }

    } catch (error) {
        console.error("Error updating user details:", error);
        return res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = { updateUserDetail };