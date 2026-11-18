
const db = require("./database/db");
const { getAllTasks } = require("./database/taskRepository");

async function test() {
  try {
    const tasks = await getAllTasks();

    console.log("Tasks saved in database:");
    console.table(tasks);
  } catch (err) {
    console.error("Error retrieving tasks:", err.message);
  } finally {
    db.close();
  }
}

test();
