const util = require("util");
const indrayniDB = require("../../db/db_connection");
let rozorpay = require("../../config/rozar_instance");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);

const get_transaction = async (req, res) => {
  try {
    let transaction_id = req.params.transaction_id;

    if (!transaction_id) {
      return res.status(400).json({ message: "Transaction ID is required." });
    }

    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to get transaction details" });
    }

    // Fetch transaction details
    let transactionQuery = `SELECT * FROM transcation WHERE transaction_id = ?`;
    let transactionResult = await queryAsync(transactionQuery, [
      transaction_id,
    ]);

    if (transactionResult.length === 0) {
      return res.status(404).json({ message: "Transaction id not found" });
    }

    let razorPayPayment = await rozorpay.payments.fetch(transaction_id);

    return res.json({
      data: {
        transaction_id: razorPayPayment?.id,
        amount: razorPayPayment?.amount / 100,
        transaction_status: razorPayPayment?.status,
        order_id: razorPayPayment?.order_id,
      },
    });
  } catch (error) {
    console.error("Error while getting transaction:", error);
    if (error.statusCode === 400 && error.error.code === "BAD_REQUEST_ERROR") {
      return res
        .status(404)
        .json({ message: "Transaction ID not found. Please check the ID." });
    }
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = { get_transaction };
