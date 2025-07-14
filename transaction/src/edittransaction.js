const util = require("util");
const indrayniDB = require("../../db/db_connection");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

const edit_transaction = async (req, res) => {
  try {
    // let { transaction_status } = req.body;
    // // Validate required fields
    // if (!transaction_id) {
    //     return res.status(400).json({ message: "Transaction ID is required." });
    // }
    // if (!transaction_status) {
    //     return res.status(400).json({ message: "Transaction status is required." });
    // }
    // if (req.user.role !== 'Admin') {
    //     return res.status(403).json({ message: "You are not authorized to update transaction." });
    // }
    // let updated_by = req.user.user_id;
    // // Fetch transaction details
    // let transactionQuery = `SELECT * FROM transcation WHERE transaction_id = ?`;
    // let transactionResult = await queryAsync(transactionQuery, [transaction_id]);
    // if (transactionResult.length === 0) {
    //     return res.status(404).json({ message: "Transaction not found." });
    // }
    // // Update transaction record
    // let updateTransactionQuery = `
    //     UPDATE transcation
    //     SET transaction_status = ?, updated_by = ?, updated_at = NOW()
    //     WHERE transaction_id = ?
    // `;
    // let transactionData = [transaction_status, updated_by, transaction_id];
    // let updateResult = await queryAsync(updateTransactionQuery, transactionData);
    // if (updateResult.affectedRows > 0) {
    //     if (transaction_status === 'success') {
    //         let currentDate = new Date();
    //         let nextYearDate = new Date(currentDate);
    //         nextYearDate.setFullYear(currentDate.getFullYear() + 1);
    //         // Fetch associated exam codes
    //         let examCodesQuery = `SELECT exam_code, order_id, created_by FROM transcation WHERE transaction_id = ?`;
    //         let examCodesResult = await queryAsync(examCodesQuery, [transaction_id]);
    //         if (examCodesResult.length === 0) {
    //             return res.status(404).json({ message: "No exam codes found for this transaction." });
    //         }
    //         // Prepare new subscriptions to insert
    //         let subscriptionInserts = examCodesResult.map(row => [
    //             row.created_by,
    //             row.exam_code,
    //             row.order_id,
    //             currentDate,
    //             nextYearDate,
    //             transaction_status
    //         ]);
    //         if (subscriptionInserts.length > 0) {
    //             let insertSubscriptionQuery = `
    //                 INSERT INTO subscriptions (user_id, exam_code, order_id, start_date, end_date, status) VALUES ?
    //             `;
    //             await queryAsync(insertSubscriptionQuery, [subscriptionInserts]);
    //         }
    //         return res.json({ message: "Transaction updated and subscriptions inserted successfully." });
    //     } else {
    //         return res.json({ message: "Transaction updated successfully." });
    //     }
    // } else {
    //     return res.status(500).json({ message: "Unable to update transaction data." });
    // }
    await queryAsync("START TRANSACTION");
    let transaction_id = req.params.transaction_id;
    let { transaction_status } = req.body;

    if (!transaction_id) {
      await queryAsync("ROLLBACK");
      return res.status(400).json({ message: "Transaction ID is required." });
    }

    if (req.user.role !== "Admin") {
      await queryAsync("ROLLBACK");
      return res
        .status(403)
        .json({ message: "You are not authorized to get transaction details" });
    }

    // Fetch transaction details
    let transactionQuery = `SELECT * FROM transcation WHERE transaction_id = ? AND NOT transaction_status = "success"`;

    let transactionResult = await queryAsync(transactionQuery, [
      transaction_id,
    ]);

    if (transactionResult.length === 0) {
      await queryAsync("ROLLBACK");
      return res.status(404).json({
        message: "Invalid transaction updation",
      });
    }
    let created_by = transactionResult[0]?.created_by;
    let order_id = transactionResult[0].order_id;
    let findorder = `select * from ord_exa_map where order_id = '${order_id}'`;
    let findorderRes = await queryAsync(findorder);

    if (findorderRes.length === 0) {
      await queryAsync("ROLLBACK");
      return res.status(404).json({
        message: "Order details not found",
      });
    }

    let exam_code = findorderRes.map((code) => {
      return code.exam_code;
    });

    let updateTransaction = `UPDATE transcation SET transaction_status = ?,updated_at = now(),updated_by = ? where transaction_id = ?`;
    let updateTransactionRes = await queryAsync(updateTransaction, [
      transaction_status,
      req.user.user_id,
      transaction_id,
    ]);

    if (updateTransactionRes.affectedRows > 0) {
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
        await queryAsync("COMMIT");
        return res.json({
          message: "Transaction update successfully",
        });
      } else {
        await queryAsync("ROLLBACK");
        return res
          .status(500)
          .json({ message: "Unable to add subscription data." });
      }
    } else {
      await queryAsync("ROLLBACK");
      return res.status(500).json({
        message: "Unable to update transcation data",
      });
    }
  } catch (error) {
    console.error(
      "Error while updating transaction and inserting subscriptions:",
      error
    );
    await queryAsync("ROLLBACK");
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = { edit_transaction };
