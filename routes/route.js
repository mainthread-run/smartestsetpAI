// Importing the required module
const express = require("express");

// Creating an instance of the express router
const Router = express.Router();

// Importing the token verification middleware
const verify_token = require("../helper/jwt/verify_jwt_token");

// Endpoint for user signup
Router.post("/auth/signup", require("../auth/src/user_signup").user_signup);

// Endpoint for user login
Router.post("/auth/login", require("../auth/src/user_login").user_login);
Router.post(
  "/auth/logout",
  verify_token,
  require("../auth/src/user_logout").user_logout
);

// Endpoint for send otp
Router.post("/auth/send_otp", require("../auth/src/send_otp").sendOtp);

// Endpoint for verify otp
Router.post("/auth/verify_otp", require("../auth/src/verify_otp").verifyOtp);

Router.post("/auth/verify", require("../auth/src/verify").verification);

Router.post("/question", require("../questions/src/insertquestion").questions);
Router.get(
  "/getquestions",
  // verify_token,
  require("../questions/src/getquestions").getquestion
);
Router.get(
  "/question/:question_id",
  // verify_token,
  require("../questions/src/getquestionbyID").getquestionbyid
);
//---- Question Update and Delete -----------
Router.put(
  "/question/:question_id",
  // verify_token,
  require("../questions/src/updatequestions").updatequestion
);
Router.delete(
  "/question/:question_id",
  // verify_token,
  require("../questions/src/deletequestion").deletequestion
);
// Router.post(
//   "/exam_question_mapping",
//   verify_token,
//   require("../exam/src/exam_que_mapping").exam_que_mapping
// );
// Router.post(
//   "/exam_question_unmapping",
//   verify_token,
//   require("../exam/src/exam_que_mapping").exam_que_unmapping
// );

//endpoint for Exams
// Router.post(
//   "/exam",
//   verify_token,
//   require("../exam/src/addexams").addExam
// );
// Router.post(
//   "/exam_type",
//   verify_token,
//   require("../exam/src/addTrendingUpcomingExams").addTrendingUpcomingExams
// );
// Router.put(
//   "/update-exam-order",
//   verify_token,
//   require("../exam/src/addTrendingUpcomingExams").updateExamOrderNumbers
// );
// Router.get(
//   "/getexams",
//   verify_token,
//   require("../exam/src/getexams").getExam
// );
// Router.put(
//   "/exam/:exam_code",
//   verify_token,
//   require("../exam/src/updateexams").updateExam
// );
// Router.delete(
//   "/exam/:exam_code",
//   verify_token,
//   require("../exam/src/deleteexams").deleteExam
// );
// Router.get(
//   "/start_exam",
//   verify_token,
//   require("../exam/src/start_exam").start_exam
// );
// Router.post(
//   "/submit_exam",
//   verify_token,
//   require("../exam/src/submit_exam").submit_exam
// );
// Router.get(
//   "/get_exam_result",
//   verify_token,
//   require("../exam/src/get_exam_result").getExamResult
// );
// Router.get(
//   "/exam/:exam_code",
//   verify_token,
//   require("../exam/src/getexambyid").getexambyid
// );
// Router.get(
//   "/examreview",
//   verify_token,
//   require("../exam/src/examreview").getExamReview
// );

// endpoint for categories
Router.post(
  "/category",
  verify_token,
  require("../categories/src/insertcategories").saveCategory
);
Router.get(
  "/categories",
  verify_token,
  require("../categories/src/getcategorie").getCategories
);
Router.put(
  "/category/:category_id",
  verify_token,
  require("../categories/src/insertcategories").saveCategory
);
Router.delete(
  "/category/:category_id",
  verify_token,
  require("../categories/src/deletecategorie").deleteCategories
);
Router.post(
  "/exam_cat_mapping",
  verify_token,
  require("../categories/src/exam_cat_mapping").map_exam_to_category
);
Router.get(
  "/cat_exam",
  verify_token,
  require("../categories/src/get_category_exam").getCategoryExam
);

//endpoint for subscription
Router.get(
  "/subscribe",
  verify_token,
  require("../subscription/src/get_subscription").get_subscription_exam
);

// endpoint for transaction
Router.post(
  "/transaction",
  verify_token,
  require("../transaction/src/addtransaction").addtransaction
);
Router.get(
  "/getpayment",
  verify_token,
  require("../transaction/src/getpayment").getpayment
);
Router.put(
  "/transaction/:transaction_id",
  verify_token,
  require("../transaction/src/edittransaction").edit_transaction
);

Router.get(
  "/transaction/:transaction_id",
  verify_token,
  require("../transaction/src/get_transaction").get_transaction
);

// endpoint for user
Router.get(
  "/getuser",
  verify_token,
  require("../user/src/getuser").getUserDetail
);
Router.put(
  "/updateuser/:user_id",
  verify_token,
  require("../user/src/updateuser").updateUserDetail
);
Router.delete(
  "/deleteuser/:user_id",
  verify_token,
  require("../user/src/deleteuser").deleteUser
);

// endpointfor for video_info
Router.get(
  "/video_info",
  verify_token,
  require("../video_info/src/get_video_info").get_video_info
);
Router.post(
  "/video_info",
  verify_token,
  require("../video_info/src/add_video_info").add_video_info
);
Router.put(
  "/video_info/:id",
  verify_token,
  require("../video_info/src/edit_video_info").update_video_info
);
Router.delete(
  "/video_info/:id",
  verify_token,
  require("../video_info/src/delete_video_info").delete_video_info
);

//endpoint for Order and payment
Router.post(
  "/order",
  verify_token,
  require("../transaction/src/save_order").saveOrder
);

// const multer = require("multer");
// // const upload = multer({ dest: "uploads/" }); // Save files in /uploads folder

// const upload = multer({
//   dest: "uploads/",
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB
//   },
// });

// login endpoint

Router.post("/login", require("../login/src/user_login").login_user);
Router.post("/register", require("../login/src/register").register_user);
Router.patch("/edituser/:user_id", require("../login/src/edit_user").edit_user);
// Router.post("/upload",require("../resume/src/upload_resume").upload_resume)

// Router.post("/upload", upload.single("file"), require("../resume/src/upload_resume").upload_resume);

Router.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }
    require("../resume/src/upload_resume").upload_resume(req, res);
  });
});

// stages api

Router.post(
  "/marks/submit",
  require("../dashboard/src/user_interview").submit_marks
);
// get stage marks
Router.get("/marks/get", require("../dashboard/src/getstage").get_stage_marks);

// get average marks
Router.get(
  "/marks/average",
  require("../dashboard/src/getavrage").get_avg_marks
);

// get overall-progress
Router.get(
  "/marks/progress",
  require("../dashboard/src/getoverall_progress").get_progress
);

// get progress
Router.get(
  "/marks/progress/details",require("../dashboard/src/getprogress").get_all_progress
);

// GET http://localhost:5000/api/getprogress?user_id=8

module.exports = Router;
