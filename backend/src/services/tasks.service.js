import db from '../db/index.js';

const INSERT_SQL = `
  INSERT INTO tasks (task_id, title, description, due_date, duration, importance, status)
  VALUES (@task_id, @title, @description, @due_date, @duration, @importance, @status)
`;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local midnight, so "today" is the server's calendar day rather than UTC. */
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Urgency from 1 (not urgent) to 5 (overdue or due today), derived from the
 * due date. Buckets keep the value stable and easy to explain.
 */
export function urgencyFor(dueDate, today = startOfToday()) {
  if (!dueDate) return 1;

  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 1;

  const days = Math.round((due - today) / DAY_MS);
  if (days <= 0) return 5;
  if (days <= 2) return 4;
  if (days <= 5) return 3;
  if (days <= 10) return 2;
  return 1;
}

function compareTasks(a, b) {
  if (b.urgency !== a.urgency) return b.urgency - a.urgency;
  if (a.due_date !== b.due_date) {
    if (a.due_date === null) return 1;
    if (b.due_date === null) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  }
  if (b.importance !== a.importance) return b.importance - a.importance;
  return a.task_id - b.task_id;
}

/**
 * Return every task, most urgent first. Urgency is computed from `due_date`
 * on each request, so it changes as tasks come due.
 */
export function listTasks() {
  const today = startOfToday();

  return db
    .prepare(
      `SELECT task_id, title, description, due_date, duration, importance, status
       FROM tasks`,
    )
    .all()
    .map((row) => ({ ...row, urgency: urgencyFor(row.due_date, today) }))
    .sort(compareTasks);
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
