const util = require("util");
const indrayniDB = require("../../db/db_connection");
const { log } = require("console");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

const addtransaction = async (req, res) => {
  // try {
  //     let { transaction_id, order_id, price, banktrans_id, transaction_date, transaction_status, created_by, exam_code } = req.body;
  //     if (!Array.isArray(exam_code) || exam_code.length === 0) {
  //         return res.status(400).json({ message: "Exam codes are required and must be a non-empty array." });
  //     }
  //     if (Object.keys(req.body).length !== 8) {
  //         return res.status(400).json({ message: "All fields are required." });
  //     }
  //     let insertTransactionQuery = `INSERT INTO transcation (transaction_id, order_id, banktrans_id, price, transaction_date, transaction_status, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`;
  //     let transactionData = [transaction_id, order_id, banktrans_id, price, transaction_date, transaction_status, created_by];
  //     let transactionResult = await queryAsync(insertTransactionQuery, transactionData);
  //     if (transactionResult.affectedRows > 0) {
  //         if (transaction_status === 'success') {
  //             let currentDate = new Date();
  //             let nextYearDate = new Date(currentDate);
  //             nextYearDate.setFullYear(currentDate.getFullYear() + 1);
  //             let insertSubscriptionQuery = `INSERT INTO subscriptions (user_id, exam_code, order_id, start_date, end_date, status) VALUES ?`;
  //             let subscriptionData = exam_code.map(code => [created_by, code, order_id, currentDate, nextYearDate, transaction_status]);
  //             let subscriptionResult = await queryAsync(insertSubscriptionQuery, [subscriptionData]);
  //             if (subscriptionResult.affectedRows > 0) {
  //                 return res.json({ message: "Subscription and transaction added successfully." });
  //             } else {
  //                 return res.status(500).json({ message: "Unable to add subscription data." });
  //             }
  //         } else {
  //             return res.json({ message: "Transaction added successfully." });
  //         }
  //     } else {
  //         return res.status(500).json({ message: "Unable to add transaction data." });
  //     }
  // } catch (error) {
  //     console.error("Error while adding subscription and transaction:", error);
  //     return res.status(500).json({ message: "Something went wrong." });
  // }
  try {
    let {
      transaction_id,
      order_id,
      price,
      banktrans_id,
      transaction_date,
      transaction_status,
      created_by,
      exam_code,
    } = req.body;

    if (
      !transaction_id ||
      !order_id ||
      !created_by ||
      !price ||
      !transaction_date ||
      !transaction_status ||
      !exam_code
    ) {
      return res.status(400).json({ message: "Please provied all details" });
    }
    if (!Array.isArray(exam_code) || exam_code.length === 0) {
      return res.status(400).json({
        message: "Exam codes are required and must be a non-empty array.",
      });
    }
    if (isNaN(order_id) || isNaN(created_by) || isNaN(price)) {
      return res.status(400).json({
        message: "Order ID and Created By and price must be numbers",
      });
    }

    order_id = Number(order_id);
    created_by = Number(created_by);

    let checkUser = `select user_id from users where user_id = '${created_by}'`;
    let checkUserRes = await queryAsync(checkUser);

    if (checkUserRes.length === 0) {
      return res.status(403).json({
        message: "user not found",
      });
    }

    let insertTransactionQuery = `INSERT INTO transcation (transaction_id, order_id, banktrans_id, price, transaction_date, transaction_status,created_by) VALUES (?, ?, ?, ?, ?, ?,?)`;
    let transactionData = [
      transaction_id,
      order_id,
      banktrans_id,
      price,
      transaction_date,
      transaction_status,
      created_by,
    ];
    let transactionResult = await queryAsync(
      insertTransactionQuery,
      transactionData
    );

    if (transactionResult.affectedRows > 0) {
      if (transaction_status === "success") {
        let finaldata = [];
        let currentDate = new Date();

        const findExamsQuery = `
        SELECT exam_code, end_date 
        FROM subscriptions 
        WHERE user_id = ? AND exam_code IN (?) AND status = "active" 
        ORDER BY end_date DESC`;
        const findExamsValues = [created_by, exam_code];

        // Execute the query once for all the exam_codes
        const examsData = await queryAsync(findExamsQuery, findExamsValues);

        for (let el of exam_code) {
          let exam = examsData.find((data) => data.exam_code === el);

          // Calculate start and end dates
          if (exam) {
            currentDate = new Date(exam.end_date);
            currentDate.setDate(currentDate.getDate() + 1);
          } else {
            currentDate = new Date();
          }

          currentDate.setUTCHours(0, 0, 0, 0);

          let endDate = new Date(currentDate);
          endDate.setFullYear(currentDate.getFullYear() + 1);
          endDate.setDate(endDate.getDate() - 1);

          // Push the subscription data for bulk insertion
          finaldata.push([
            created_by,
            el,
            order_id,
            currentDate,
            endDate,
            "active",
          ]);
        }
        let insertSubscriptionQuery = `INSERT INTO subscriptions (user_id, exam_code, order_id, start_date, end_date, status) VALUES ?`;
        let subscriptionResult = await queryAsync(insertSubscriptionQuery, [
          finaldata,
        ]);

        if (subscriptionResult.affectedRows === exam_code.length) {
          return res.json({
            message: "Transaction added successfully",
          });
        } else {
          return res
            .status(500)
            .json({ message: "Unable to add subscription data." });
        }
      } else {
        return res.json({ message: "Transaction added successfully." });
      }
    } else {
      return res
        .status(500)
        .json({ message: "Unable to add transaction data." });
    }
  } catch (error) {
    console.error("Error while adding subscription and transaction:", error);

    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = { addtransaction };
