import db from '../db/index.js';

const INSERT_SQL = `
  INSERT INTO tasks (task_id, title, description, due_date, duration, importance, urgency, status)
  VALUES (@task_id, @title, @description, @due_date, @duration, @importance, @urgency, @status)
`;

/**
 * Return every task, most urgent work first.
 * `due_date` is stored as text (ISO `YYYY-MM-DD`), so a plain sort works.
 */
export function listTasks() {
  return db
    .prepare(
      `SELECT task_id, title, description, due_date, duration, importance, urgency, status
       FROM tasks
       ORDER BY due_date IS NULL, due_date ASC, importance DESC, task_id ASC`,
    )
    .all();
}

export function countTasks() {
  return db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;
}

/**
 * Delete all existing tasks and insert the supplied ones in a single
 * transaction, so a failed import never leaves the table half-empty.
 */
export function replaceTasks(tasks) {
  const run = db.transaction((rows) => {
    db.prepare('DELETE FROM tasks').run();
    // Restart AUTOINCREMENT so re-loading the CSV produces stable ids.
    try {
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'tasks'").run();
    } catch {
      // sqlite_sequence only exists once an AUTOINCREMENT row has been written.
    }
    const insert = db.prepare(INSERT_SQL);
    for (const row of rows) insert.run(row);
  });

  run(tasks);
  return tasks.length;
}

/** Append tasks without clearing the table. */
export function appendTasks(tasks) {
  const run = db.transaction((rows) => {
    const insert = db.prepare(INSERT_SQL);
    for (const row of rows) insert.run(row);
  });

  run(tasks);
  return tasks.length;
}
