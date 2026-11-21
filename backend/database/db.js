const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Location of the database file
const dbPath = process.env.DB_FILE ||
  path.join(__dirname, "tasks.db");

// Location of the shared SQL schema
const schemaPath = path.join(
  __dirname, "..", "..", "database", "schema.sql"
);

// Read the SQL schema
const schema = fs.readFileSync(schemaPath, "utf8");

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Initialize the database
db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error("Table creation error:", err.message);
    } else {
      console.log("Tasks table is ready.");
    }
  });
});

module.exports = db;
