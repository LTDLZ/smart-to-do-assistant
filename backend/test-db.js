
const db = require("./database/db");

db.get(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'",
  (err, row) => {
    if (err) {
      console.error("Test failed:", err.message);
    } else if (row) {
      console.log("Success! Tasks table exists.");
    } else {
      console.log("Tasks table was not created.");
    }

    db.close();
  }
);
