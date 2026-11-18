
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Location of our database file
const dbPath = path.join(__dirname, "tasks.db");

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create the tasks table
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    duration INTEGER,
    importance INTEGER NOT NULL DEFAULT 3
      CHECK (importance BETWEEN 1 AND 5),
    urgency INTEGER,
    status TEXT NOT NULL DEFAULT 'Pending'
      CHECK (status IN ('Pending', 'In Progress', 'Completed'))
  )
`, (err) => {
  if (err) {
    console.error("Table creation error:", err.message);
  } else {
    console.log("Tasks table is ready.");
  }
});

module.exports = db;
