const db = require("./database/db");
const { updateTask, getAllTasks } = require("./database/taskRepository");

async function test() {
  try {
    const changes = await updateTask(
      1,
      "Finish ITEC 4020 project",
      "Complete and test the database functions",
      "2026-12-08T23:59",
      90,
      5,
      "In Progress"
    );

    console.log("Number of updated tasks:", changes);

    const tasks = await getAllTasks();
    console.table(tasks);
  } catch (err) {
    console.error("Error updating task:", err.message);
  } finally {
    db.close();
  }
}

test();
