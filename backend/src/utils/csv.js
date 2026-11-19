import { parse } from 'csv-parse/sync';

export const TASK_COLUMNS = [
  'task_id',
  'title',
  'description',
  'due_date',
  'duration',
  'importance',
  'status',
];

export const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];

/** Turn an empty/blank CSV cell into `null`. */
function text(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

/** Parse an integer cell, returning `null` when blank and throwing on garbage. */
function integer(value, column, rowNumber) {
  const raw = text(value);
  if (raw === null) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Row ${rowNumber}: "${column}" must be an integer (received "${raw}")`);
  }
  return parsed;
}

/**
 * Convert one raw CSV record into a task object that matches the DB schema.
 * Throws a descriptive error when a value would violate a constraint.
 */
export function normalizeTask(record, rowNumber) {
  const title = text(record.title);
  if (!title) {
    throw new Error(`Row ${rowNumber}: "title" is required`);
  }

  const importance = integer(record.importance, 'importance', rowNumber) ?? 3;
  if (importance < 1 || importance > 5) {
    throw new Error(`Row ${rowNumber}: "importance" must be between 1 and 5 (received "${importance}")`);
  }

  const status = text(record.status) ?? 'Pending';
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Row ${rowNumber}: "status" must be one of ${VALID_STATUSES.join(', ')} (received "${status}")`,
    );
  }

  return {
    task_id: integer(record.task_id, 'task_id', rowNumber),
    title,
    description: text(record.description),
    due_date: text(record.due_date),
    duration: integer(record.duration, 'duration', rowNumber),
    importance,
    status,
  };
}

/**
 * Parse the contents of the sample CSV file into validated task objects.
 */
export function parseTasksCsv(content) {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  return records.map((record, index) => normalizeTask(record, index + 2)); // +2 => header is line 1
}
