const cron = require("node-cron");
const util = require("util");
const indrayaniDB = require("../db/db_connection"); // Assuming your db_connection is set up correctly
const queryAsync = util.promisify(indrayaniDB.query).bind(indrayaniDB);

let sub_expired = () => {
  // This cron job runs every day at midnight
  cron.schedule("0 0 * * *", async function () {
    // Query to find subscriptions where the end_date is in the past and status is not 'expired'
    const query = `
      UPDATE subscriptions
      SET status = 'expired'
      WHERE end_date < NOW() AND status != 'expired';
    `;

    try {
      const result = await queryAsync(query);
       //console.log(`Successfully updated ${result.affectedRows} expired subscriptions.`);
    } catch (err) {
      console.error("Error updating expired subscriptions:", err);
    }
  });
};

module.exports = { sub_expired };
