
const db = require("./db");

// Function to add a new task
function addTask(title, description, dueDate, duration, importance = 3) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tasks
      (title, description, due_date, duration, importance)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [title, description, dueDate, duration, importance],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

function getAllTasks() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM tasks ORDER BY task_id";

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


// Export the function so other files can use it

// Update an existing task
function updateTask(taskId, title, description, dueDate, duration, importance, status) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tasks
      SET title = ?,
          description = ?,
          due_date = ?,
          duration = ?,
          importance = ?,
          status = ?
      WHERE task_id = ?
    `;

    db.run(
      sql,
      [title, description, dueDate, duration, importance, status, taskId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
}


// Delete a task by its ID
function deleteTask(taskId) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM tasks WHERE task_id = ?";

    db.run(sql, [taskId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

module.exports = { addTask, getAllTasks, updateTask, deleteTask };