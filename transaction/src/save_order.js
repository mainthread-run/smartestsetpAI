const util = require("util");
const indrayniDB = require("../../db/db_connection");

const queryAsync = util.promisify(indrayniDB.query).bind(indrayniDB);
let rozorpay = require("../../config/rozar_instance");
const saveOrder = async (req, res) => {
  try {
    await queryAsync("START TRANSACTION");
    let { user_id, total_amount, payable_amount, discount, exam_code } =
      req.body;

    if (!Array.isArray(exam_code) || exam_code.length === 0) {
      return res.status(400).json({
        message:
          "Please provide a valid exam code. It must be a non-empty array",
      });
    }

    if (
      ![user_id, total_amount, payable_amount].every(
        (field) => field !== undefined && !isNaN(field)
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide all details with numeric values for user_id, total_amount, and payable_amount.",
      });
    }

    user_id = Number(user_id);
    total_amount = Number(total_amount);
    payable_amount = Number(payable_amount);

    let saveOrderQuery = `INSERT INTO orders(user_id,total_amount,payable_amount,discount)VALUES(?,?,?,?)`;
    let saveOrderValues = [
      user_id,
      total_amount,
      payable_amount,
      discount || 0,
    ];
    let saveOrderRes = await queryAsync(saveOrderQuery, saveOrderValues);

    if (saveOrderRes.affectedRows == 0) {
      await queryAsync("ROLLBACK");
      return res.status(500).json({ message: "Unable to genrate Order ID" });
    }
    let order_id = saveOrderRes.insertId;

    let e_value = exam_code.map((el) => `(${order_id},'${el}')`).join(",");

    let saveMapping = `insert into ord_exa_map(order_id,exam_code)VALUES ${e_value}`;
    let saveMappingRes = await queryAsync(saveMapping);

    if (saveMappingRes.affectedRows == exam_code.length) {
      const razorOrderOption = {
        amount: payable_amount * 100, //eg.for paisa
        currency: "INR",
        receipt: String(order_id),
        payment_capture: 1,
      };

      let razorPayOrder = await rozorpay.orders.create(razorOrderOption);

      req.body.order_id = order_id;
      req.body.razor_order_id = razorPayOrder.id;
      req.body.status = razorPayOrder.status;
      req.body.receipt = razorPayOrder.receipt;
      req.body.created_at = new Date(razorPayOrder.created_at * 1000);

      await queryAsync("COMMIT");
      return res.json({
        message: "Order genrated succesfully",
        data: req.body,
      });
    } else {
      await queryAsync("ROLLBACK");
      return res
        .status(500)
        .json({ message: "Unable to add order exam mapping" });
    }
  } catch (error) {
    console.log("Error in save order :", error);
    await queryAsync("ROLLBACK");
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = { saveOrder };
