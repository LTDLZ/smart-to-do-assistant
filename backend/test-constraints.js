const assert = require("node:assert/strict");
const db = require("./database/db");

const {
  addTask,
  updateTask
} = require("./database/taskRepository");

async function test() {
  try {
    // Test required title
    await assert.rejects(
      addTask(null, "Test", "2026-12-08", 30, 3),
      /SQLITE_CONSTRAINT/
    );
    console.log("PASS: Missing title rejected");

    // Test maximum importance
    await assert.rejects(
      addTask("Test", "Test", "2026-12-08", 30, 6),
      /SQLITE_CONSTRAINT/
    );
    console.log("PASS: Importance above 5 rejected");

    // Test minimum importance
    await assert.rejects(
      addTask("Test", "Test", "2026-12-08", 30, 0),
      /SQLITE_CONSTRAINT/
    );
    console.log("PASS: Importance below 1 rejected");

    // Create a valid task
    const id = await addTask(
      "Valid task", "Test", "2026-12-08", 30, 3
    );

    // Test invalid status
    await assert.rejects(
      updateTask(
        id, "Valid task", "Test",
        "2026-12-08", 30, 3, "Invalid"
      ),
      /SQLITE_CONSTRAINT/
    );
    console.log("PASS: Invalid status rejected");

    console.log("All constraint tests passed successfully!");
  } catch (err) {
    console.error("Constraint test failed:", err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

test();
