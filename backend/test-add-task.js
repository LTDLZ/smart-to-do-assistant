
const db = require("./database/db");
const { addTask } = require("./database/taskRepository");

async function test() {
  try {
    const taskId = await addTask(
      "Finish ITEC 4020 assignment",
      "Complete the database part",
      "2026-11-17T23:59",
      120,
      5
    );

    console.log("Task added successfully!");
    console.log("New task ID:", taskId);
  } catch (err) {
    console.error("Error adding task:", err.message);
  } finally {
    db.close();
  }
}

test();