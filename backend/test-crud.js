const assert = require("node:assert/strict");
const db = require("./database/db");

const {
  addTask,
  getAllTasks,
  updateTask,
  deleteTask
} = require("./database/taskRepository");

async function test() {
  try {
    // CREATE
    const taskId = await addTask(
      "Complete project",
      "Test database operations",
      "2026-12-08",
      120,
      5
    );

    assert.ok(taskId > 0);
    console.log("PASS: Create task");

    // READ
    let tasks = await getAllTasks();
    let task = tasks.find(t => t.task_id === taskId);

    assert.ok(task);
    assert.equal(task.title, "Complete project");
    assert.equal(task.description, "Test database operations");
    assert.equal(task.due_date, "2026-12-08");
    assert.equal(task.duration, 120);
    assert.equal(task.importance, 5);
    assert.equal(task.status, "Pending");
    console.log("PASS: Read task");

    // UPDATE
    const updated = await updateTask(
      taskId,
      "Complete final project",
      "Updated description",
      "2026-12-09",
      90,
      4,
      "In Progress"
    );

    assert.equal(updated, 1);

    tasks = await getAllTasks();
    task = tasks.find(t => t.task_id === taskId);

    assert.equal(task.title, "Complete final project");
    assert.equal(task.description, "Updated description");
    assert.equal(task.due_date, "2026-12-09");
    assert.equal(task.duration, 90);
    assert.equal(task.importance, 4);
    assert.equal(task.status, "In Progress");
    console.log("PASS: Update task");

    // DELETE
    const deleted = await deleteTask(taskId);
    assert.equal(deleted, 1);

    tasks = await getAllTasks();
    assert.equal(
      tasks.some(t => t.task_id === taskId),
      false
    );

    console.log("PASS: Delete task");

    console.log("All CRUD tests passed successfully!");
  } catch (err) {
    console.error("CRUD test failed:", err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

test();
