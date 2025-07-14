
const util = require('util');
const indrayniDB = require('../../db/db_connection');

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

let getpayment = async (req, res) => {
    try {
        let { user_id, transaction_id } = req.query;

        let selectTransData = `
            SELECT 
                t.order_id,
                t.transaction_date,
                transaction_status,
                t.price AS price,
                GROUP_CONCAT(e.exam_name ORDER BY e.exam_name ASC SEPARATOR ', ') AS exam_name,
                GROUP_CONCAT(e.exam_code ORDER BY e.exam_code ASC SEPARATOR ', ') AS exam_code,
                t.transaction_id,
                IFNULL(CONCAT(up.first_name, ' ', up.last_name), '') AS updated_by,
                IFNULL(t.updated_at, '') AS updated_at,
                CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, '')) AS user_name,
                u.email,
                u.mobile
            FROM 
                transcation t
            INNER JOIN 
                orders o ON t.order_id = o.order_id
            INNER JOIN 
                ord_exa_map oem ON o.order_id = oem.order_id
            INNER JOIN 
                exams e ON oem.exam_code = e.exam_code
            INNER JOIN 
                users u ON o.user_id = u.user_id
            LEFT JOIN 
                users up ON t.updated_by = up.user_id
            WHERE 1=1 AND t.price > 0`;

        let queryParams = [];
        if (user_id) {
            selectTransData += ` AND o.user_id = ?`;
            queryParams.push(user_id);
        }
        if (transaction_id) {
            selectTransData += ` AND t.transaction_id = ?`;
            queryParams.push(transaction_id);
        }

        selectTransData += ` GROUP BY t.order_id, t.transaction_date, t.transaction_id, updated_by, updated_at, user_name, u.email, u.mobile`;

        let result = await queryAsync(selectTransData, queryParams);
        
        if (result.length > 0) {
            return res.json({ data: result });
        } else {
            return res.status(404).json({ message: 'No payment data found' });
        }
    } catch (error) {
        console.error('Unable to retrieve payment data:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { getpayment };



