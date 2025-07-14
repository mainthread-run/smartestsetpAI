const express = require("express");
const cors = require("cors");
const figlet = require("figlet");
const path = require("path");
// require("dotenv").config();
const fileUpload = require("express-fileupload");

const { sub_expired } = require("./cron_job/subscription_expried");
sub_expired();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static("public"));
app.use("/api", require("./routes/route"));
app.use(express.static("public"));



const PORT = 8000;

const server = app.listen(PORT, () => {
    figlet("Smart Step AI", async (err, data) => {
      if (err) {
        console.log("Somethig Went Wrong With figlet");
        console.dir(err);
        return;
      }
    console.log(data);
    console.log(`Running on Port: ${PORT} with process id: ${process.pid}`);
    });
  });
  
module.exports = server;