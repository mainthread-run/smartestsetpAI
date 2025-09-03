const util = require("util");
const db = require("../../db/db_connection");
const queryAsync = util.promisify(db.query).bind(db);

const STAGE_MAP = {
  "technical entry": "technical interview",
  "technical interview": "technical interview",
  "technical moderate": "technical interview",
  "technical advanced": "technical interview",

  "hr entry": "final interview",
  "hr moderate": "final interview",
  "hr advanced": "final interview",
  "final interview": "final interview",

  "basic interview": "basic interview",
  "resume analysis": "basic interview",
  "ai interview": "basic interview",
};

const REQUIRED_STAGES = [
  "basic interview",
  "technical interview",
  "final interview",
];
const PASS_MARK_PERCENTAGE = 60;

// --- Helper to process all users ---
async function calculateUserStats() {
  const sql = `SELECT user_id, staged_type, obtained_mark, total_mark, created_at 
               FROM marks_staging ORDER BY created_at ASC`;
  const rows = await queryAsync(sql);

  const users = {};

  rows.forEach((row) => {
    const stage =
      STAGE_MAP[row.staged_type.toLowerCase()] || row.staged_type.toLowerCase();

    if (!users[row.user_id]) {
      users[row.user_id] = {
        attempts: [],
        currentAttempt: {},
        lastDate: row.created_at,
      };
    }

    users[row.user_id].currentAttempt[stage] = {
      obtained: row.obtained_mark,
      total: row.total_mark,
    };

    if (REQUIRED_STAGES.every((s) => users[row.user_id].currentAttempt[s])) {
      users[row.user_id].attempts.push(users[row.user_id].currentAttempt);
      users[row.user_id].currentAttempt = {};
      users[row.user_id].lastDate = row.created_at;
    }
  });

  // Calculate stats per user
  const results = Object.entries(users).map(([user_id, data]) => {
    let success = 0;
    let total = data.attempts.length;
    let scores = [];

    data.attempts.forEach((attempt) => {
      let passed = true;
      let sum = 0,
        count = 0;

      REQUIRED_STAGES.forEach((stage) => {
        const mark = attempt[stage];
        const percent = (mark.obtained / mark.total) * 100;
        sum += percent;
        count++;
        if (percent < PASS_MARK_PERCENTAGE) passed = false;
      });

      scores.push(sum / count);
      if (passed) success++;
    });

    return {
      user_id,
      total_attempts: total,
      success_attempts: success,
      success_rate: total ? (success / total) * 100 : 0,
      avg_score: scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0,
      last_attempt_date: data.lastDate,
    };
  });

  // Sort leaderboard
  results.sort((a, b) => {
    if (b.success_rate !== a.success_rate)
      return b.success_rate - a.success_rate;
    if (b.avg_score !== a.avg_score) return b.avg_score - a.avg_score;
    return new Date(b.last_attempt_date) - new Date(a.last_attempt_date);
  });

  // Assign ranks
  results.forEach((u, i) => (u.rank = i + 1));

  return results;
}

// --- Leaderboard API ---
const get_leaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const results = await calculateUserStats();

    const start = (page - 1) * limit;
    const end = start + parseInt(limit);

    return res.json({
      total_users: results.length,
      page: parseInt(page),
      limit: parseInt(limit),
      leaderboard: results.slice(start, end),
    });
  } catch (error) {
    console.error("Error in get_leaderboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --- My Rank API ---
const get_my_rank = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: "User ID required" });

    const results = await calculateUserStats();
    const user = results.find((u) => u.user_id == user_id);

    if (!user)
      return res.status(404).json({ message: "User not found in leaderboard" });

    return res.json(user);
  } catch (error) {
    console.error("Error in get_my_rank:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { get_leaderboard, get_my_rank };
