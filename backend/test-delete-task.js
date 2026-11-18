const db = require("./database/db");
const {
  addTask,
  getAllTasks,
  deleteTask
} = require("./database/taskRepository");

async function test() {
  try {
    // Create a temporary task just for testing
    const taskId = await addTask(
      "Temporary test task",
      "This task will be deleted",
      "2026-12-08T12:00",
      10,
      3
    );

    console.log("Created temporary task:", taskId);

    // Delete only the temporary task
    const changes = await deleteTask(taskId);
    console.log("Number of deleted tasks:", changes);

    // Check that the temporary task is gone
    const tasks = await getAllTasks();
    const stillExists = tasks.some(task => task.task_id === taskId);

    console.log("Temporary task still exists:", stillExists);
    console.table(tasks);
  } catch (err) {
    console.error("Delete test failed:", err.message);
  } finally {
    db.close();
  }
}

test();
